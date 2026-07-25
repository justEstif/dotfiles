import {spawn} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {BorderedLoader, type ExtensionAPI, type ExtensionContext} from '@earendil-works/pi-coding-agent';

function getLastAssistantText(ctx: ExtensionContext): string | undefined {
  const branch = ctx.sessionManager.getBranch();

  for (let i = branch.length - 1; i >= 0; i--) {
    const entry = branch[i];
    if (entry.type !== 'message') continue;

    const msg = entry.message;
    if (!('role' in msg) || msg.role !== 'assistant') continue;

    const text = msg.content
      .filter((c): c is {type: 'text'; text: string} => c.type === 'text')
      .map((c) => c.text)
      .join('\n')
      .trim();

    if (text) return text;
  }

  return undefined;
}

export default function (pi: ExtensionAPI) {
  const loadLastAssistantMessage = async (ctx: ExtensionContext) => {
    const text = getLastAssistantText(ctx);

    if (!text) {
      ctx.ui.notify('No assistant message found', 'error');
      return;
    }

    const editorCmd = process.env.VISUAL || process.env.EDITOR;
    if (!editorCmd) {
      ctx.ui.notify('No editor configured. Set $VISUAL or $EDITOR.', 'error');
      return;
    }

    if (ctx.mode !== 'tui') {
      const edited = await ctx.ui.editor('Edit last assistant message', text);
      if (edited !== undefined) ctx.ui.setEditorText(edited);
      return;
    }

    const edited = await ctx.ui.custom<string | null>((tui, theme, _kb, done) => {
      const loader = new BorderedLoader(tui, theme, `Launching external editor: ${editorCmd}`);
      const tmpFile = path.join(os.tmpdir(), `pi-last-message-${Date.now()}.md`);

      const run = async () => {
        try {
          fs.writeFileSync(tmpFile, text, 'utf-8');
          tui.stop();

          const [editor, ...editorArgs] = editorCmd.split(' ');
          process.stdout.write(`Launching external editor: ${editorCmd}\nPi will resume when the editor exits.\n`);

          const status = await new Promise<number | null>((resolve) => {
            const child = spawn(editor, [...editorArgs, tmpFile], {
              stdio: 'inherit',
              shell: process.platform === 'win32',
            });
            child.on('error', () => resolve(null));
            child.on('close', (code) => resolve(code));
          });

          if (status === 0) {
            done(fs.readFileSync(tmpFile, 'utf-8').replace(/\n$/, ''));
          } else {
            done(null);
          }
        } finally {
          try {
            fs.unlinkSync(tmpFile);
          } catch {
            // ignore cleanup errors
          }
          tui.start();
          tui.requestRender(true);
        }
      };

      setTimeout(() => void run(), 0);
      return loader;
    });

    if (edited === null) {
      ctx.ui.notify('External editor cancelled or exited non-zero', 'info');
      return;
    }

    ctx.ui.setEditorText(edited);
    ctx.ui.notify('Loaded edited message into input', 'info');
  };

  pi.registerCommand('last-to-editor', {
    description: 'Load last assistant message into editor',
    handler: async (_args, ctx) => {
      await loadLastAssistantMessage(ctx);
    },
  });
}

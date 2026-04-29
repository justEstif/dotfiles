function pi --wraps pi --description 'pi coding agent with bare nvim as external editor'
    VISUAL="nvim --clean" mise x node@lts -- pi $argv
end

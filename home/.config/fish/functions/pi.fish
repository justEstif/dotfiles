function pi --description 'pi coding agent'
    # macOS: pi installs as an npm package (needs a mise-managed node env).
    # Linux: pi is a core-registry mise binary — invoke the shim directly.
    switch (uname)
        case Darwin
            mise x node@lts -- pi $argv
        case '*'
            command pi $argv
    end
end

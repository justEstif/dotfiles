function __pi_sandbox_ensure_image --argument-names image dockerfile
    command docker info >/dev/null 2>&1
    if test $status -ne 0
        if test (uname) = Darwin; and command -q colima
            printf 'pi-sandbox: Docker is unavailable; start Colima with: colima start\n' >&2
        else
            printf 'pi-sandbox: Docker daemon is unavailable\n' >&2
        end
        return 1
    end

    command docker image inspect $image >/dev/null 2>&1; and return 0
    printf 'pi-sandbox: building container image %s\n' $image >&2
    command docker build --tag $image --file $dockerfile (path dirname $dockerfile)
end

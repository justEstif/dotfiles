function chief-pi --description "Attach to (or launch) the chief-of-staff pi agent here"
    if hc get chief-of-staff &>/dev/null
        hc attach chief-of-staff
    else
        hc run --bg --name chief-of-staff --cwd (pwd) chief-of-staff
    end
end

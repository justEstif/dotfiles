function chief-pi --description "Launch a fresh chief-of-staff pi agent here (identity baked into system prompt)"
    set -l name "chief-"(date +%H%M%S)
    hc run --bg --name $name --cwd (pwd) chief-of-staff
end

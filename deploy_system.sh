cd /home/ubuntu/447-Team4-Crime-Visualizer/frontend/crime-visualizer
sudo PORT=80 npm run start &

cd /home/ubuntu/447-Team4-Crime-Visualizer/backend
source env/bin/activate
python3 application.py &

read -r -d '' _ </dev/tty
trap 'kill $(jobs -p)' EXIT

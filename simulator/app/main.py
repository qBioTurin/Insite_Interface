from flask import Flask, request, send_file, jsonify
import subprocess
import json
import os

app = Flask(__name__)

@app.route("/clean_data", methods=['GET'])
def clean_data():
    try:
        os.system("rm -rf /data/*")

        return jsonify({
            "stdout": 'ok',
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/run-r", methods=["POST"])
def run_r_script():
    try:
        param = request.json

        os.makedirs("/data", exist_ok=True)

        # Salva i parametri come file JSON
        with open("/data/params.json", "w") as f:
            json.dump(param, f, indent=4)

        subprocess.run(
            ["Rscript", "/app/scripts/run_simulation.R", "/data/params.json", "/data"],
            capture_output=True,
            text=True
        )
        return jsonify({
            "stdout": param,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/get_obs_tum", methods=["GET"])
def get_obs_tum():
    depth = request.args.get("depth")
    try:
        subprocess.run(
            ["Rscript", "/app/scripts/get_obs_tum.R", "/data", depth],
            capture_output=True,
            text=True
        )
        
        with open("/data/label_color.json", "r") as f:
            data = json.load(f)

        return jsonify({
            "stdout": data,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/draw_plot", methods=["POST"])
def draw_plot():
    try:
        param = request.json

        os.makedirs("/data", exist_ok=True)

        # Salva i parametri come file JSON
        with open("/data/labeled_colors.json", "w") as f:
            json.dump(param, f, indent=4)

        subprocess.run(
            ["Rscript", "/app/scripts/draw_plot.R", "/data",  "/data/labeled_colors.json", "/data"],
            capture_output=True,
            text=True
        )
        
        with open("/data/little_label_k.json", "r") as f:
            data = json.load(f)
        
        return jsonify({
            "stdout": data,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/check_percentage", methods=["GET"])
def check_percentage():
    try:
        total_expected = int(request.args.get("checkpoints"))
        folder_path = "/data/sim1" 

        num_files = len([f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))])

        percentage = (num_files / total_expected) * 100

        return jsonify({
            "stdout": f"{percentage:.2f}%"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/download_image", methods=["GET"])
def download_file():
    frequence = request.args.get("frequence") if request.args.get("frequence") != '' else 'absolute'
    file_path = os.path.join(
        "/data",
        f"plot_show_{frequence}.png"
    )
    print(f"Open file: {file_path}")
    
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return {"error": "File not found"}, 404
    
@app.route('/download_pdf', methods=['GET'])
def download_pdf():
    frequence = request.args.get("frequence") if request.args.get("frequence") != '' else 'absolute'
    return send_file(f'/data/plot_download_{frequence}.pdf', as_attachment=True)

@app.route("/download_side_plot", methods=["GET"])
def download_side_plot():
    file_path = os.path.join(
        "/data",
        f"side_plot_show.png"
    )
    print(f"Open file: {file_path}")
    
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return {"error": "File not found"}, 404
    
@app.route("/get_sequencing", methods=["GET"])
def get_sequencing():
    numSeq = request.args.get("numSeq")
    try:
        subprocess.run(
            ["Rscript", "/app/scripts/get_sequencing.R", "/data", numSeq],
            capture_output=True,
            text=True
        )
        
        with open("/data/seq_barplot_df.json", "r") as f:
            data = json.load(f)

        return jsonify({
            "stdout": data,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

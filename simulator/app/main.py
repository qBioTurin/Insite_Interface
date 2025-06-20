from flask import Flask, request, jsonify
import subprocess
import json
import os

app = Flask(__name__)


@app.route("/run-r", methods=["POST"])
def run_r_script():
    try:
        param = request.json

        os.makedirs("/data", exist_ok=True)

        # Salva i parametri come file JSON
        with open("/data/params.json", "w") as f:
            json.dump(param, f, indent=4)

        result = subprocess.run(
            ["Rscript", "/app/scripts/run_simulation.R"],
            capture_output=True,
            text=True
        )
        return jsonify({
            "stdout": param,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

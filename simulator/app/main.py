from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route("/run-r", methods=["POST"])
def run_r_script():
    try:
        param = request.json

        # Esegui lo script R con un parametro
        # result = subprocess.run(
        #     ["Rscript", "script.R", param],
        #     capture_output=True,
        #     text=True
        # )
        return jsonify({
            "stdout": param,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)

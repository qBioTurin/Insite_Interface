FROM r-base:latest

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Crea un virtualenv
RUN python3 -m venv /opt/venv

# Attiva il virtualenv e installa Flask
RUN /opt/venv/bin/pip install flask

# Imposta il PATH di default
ENV PATH="/opt/venv/bin:$PATH"

# Copia i file
WORKDIR /app
COPY app/ .

# Espone la porta
EXPOSE 5001

# Esegui Flask con Python nel virtualenv
CMD ["python", "main.py"]

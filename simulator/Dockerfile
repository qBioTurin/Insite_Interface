FROM r-base:4.4.1

RUN apt-get update
RUN apt-get install gcc make libbz2-dev zlib1g-dev libncurses5-dev libncursesw5-dev liblzma-dev bzip2 g++ rsync libsqlite3-dev -y
RUN apt-get install build-essential libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev -y
COPY ./Python-3.11.2.tar.xz /tmp/Python-3.11.2.tar.xz
RUN tar -xf /tmp/Python-3.11.2.tar.xz

WORKDIR /Python-3.11.2
RUN ./configure --enable-optimizations
RUN make install
RUN pip3 install flask

WORKDIR /

RUN apt-get update
RUN apt-get install libxml2-dev libssl-dev libcurl4-openssl-dev libgit2-dev libfribidi-dev  libpng-dev libtiff5-dev libjpeg-dev libudunits2-dev cmake -y
RUN apt-get install  libfreetype6-dev libharfbuzz-dev libfontconfig1-dev   -y 

# RUN R -e "install.packages('glue')"
# RUN R -e "install.packages('BiocManager')"
# RUN R -e "install.packages('ggplot2')"
# RUN R -e "BiocManager::install('phyloseq')"
# RUN R -e "BiocManager::install('DESeq2')"
# RUN R -e "BiocManager::install('microbiome')"
# RUN R -e "install.packages('tidyverse')"
# RUN R -e "install.packages('devtools')"
# RUN R -e "devtools::install_github('microsud/microbiomeutilities')"

# COPY Rscripts/Packages.R Rscripts/Packages.R

# # RUN Rscript Rscripts/Packages.R

# COPY Rscripts ./Rscripts

# COPY app.py .

WORKDIR /app
COPY app/scripts/install_libraries.R .

RUN Rscript install_libraries.R

COPY app .

EXPOSE 5000

CMD ["python3", "main.py"]

source("libraries.R")
source("inport_par.R")
source("Utils.R")
source("Population.R")
source("Local_Params.R")
source("Population_with_size_nmut.R")
source("Simulazioni_fenotipo_classi.R")



load("/data/Parameters.RData")
path<-"/data"
Nexp<-1

simulazione(Nexp=Nexp,
            path = path,
            starting_gen = starting_gen,
            starting_fun_eff=starting_fun_eff,
            tmax=tmax,
            Ncellsmax = NULL,
            Ncells_start = Ncells_start,
            parameters = parameters)


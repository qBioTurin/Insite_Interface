source("scripts/install_libraries.R")
source("scripts/libraries.R")
source("scripts/Utils.R")
source("scripts/Population.R")
source("scripts/Local_Params.R")
source("scripts/Population_with_size_nmut.R")
source("scripts/Simulation_onlylast.R")

option_list<-list(
  make_option(
    c("--Nexp"),
    type="integer",
    default = 1,
    help = "simulation number"
  ),
  make_option(
    c("--seed"),
    type="integer",
    default = as.integer(Sys.time()),
    help = "Seed for the first simulation"
  ),
  make_option(
    c("--params_RData"),
    type="character",
    default = "raw/Parameters.RData",
    help = "RData file created by import_par_slurm"
  ),
  make_option(
    c("--output_dir"),
    type="character",
    default = "raw",
    help = "directory for the simulation output"
  )
)

opt_parser<-OptionParser(option_list = option_list)
opt<-parse_args(opt_parser)
path_out<-opt$output_dir
Nexp<-opt$Nexp

load(opt$params_RData)

simulazione(Nexp=Nexp,
            seed=opt$seed,
            path = path_out,
            starting_gen = starting_gen,
            starting_fun_eff=starting_fun_eff,
            tmax=tmax,
            Ncellsmax = Ncellsmax,
            Ncells_start = Ncells_start,
            parameters = parameters)


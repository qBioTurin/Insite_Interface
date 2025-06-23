source("/app/scripts/install_libraries.R")
source("/app/scripts/libraries.R")
source("/app/scripts/Utils.R")

# args<-commandArgs(trailingOnly = TRUE)
# json_data <- fromJSON(file=args(1))
json_data <- fromJSON(file="/data/params.json")

length_panel<-json_data$mutableBases
K_base<-json_data$carryingCapacity
tmax<-json_data$endingTime
Np<-json_data$savingCheckpoints
av_lifespan<-json_data$cellLife
mut_rate_base<-json_data$mutationRate

functional_effects<-sapply(json_data$functionalEvents,
                           function(event){event$type})
names(functional_effects)<-sapply(json_data$functionalEvents,
                                  function(event){event$name})

starting_gen<-json_data$populations$genotype
starting_fun_eff<-json_data$populations$phenotype
Ncells_start<-json_data$populations$numCells

s<-vector()
for(event in json_data$functionalEvents){
  if(event$type=="growth"){
    s<-c(s,event$params$proliferativeAdvantage)
  }
}

m<-vector()
for(event in json_data$functionalEvents){
  if(event$type=="mutation"){
    m<-c(m,event$params$mutationalAmplificationFactor)
  }
}

k<-vector()
for(event in json_data$functionalEvents){
  if(event$type=="space"){
    k<-c(k,event$params$additionalSpace)
  }
}

alpha<-list()
for(event in json_data$functionalEvents){
  if(event$type=="competition"){
    alpha<-append(alpha,list(c(event$params$susceptibility,
                               event$params$offensiveScore)))
  }
}

rel_freq<-sapply(json_data$functionalEvents,function(fun_ev){fun_ev$frequency})

I<-length(functional_effects)
L<-2^I-1
binary_mat <- number2binary(1:L,I)

mu<-rep(mut_rate_base*length_panel,L)
if(length(m)>0){
  mu<-matrix(binary_mat[,functional_effects=="mutation"]*rep(m,each=L),ncol=length(m))
  mu[mu==0]<-1
  mu<-rowProds(mu)*mut_rate_base*length_panel
}

influence<-matrix(1,I,I)
diag(influence)<-rel_freq

sel_adv=rep(0,I)
sel_adv[functional_effects=="growth"]<-s
lambda=rowSums(t(t(binary_mat)*sel_adv)) # vantaggio selettivo di ogni clone (somma vantaggi sue driver)


alpha_complete<-list()
alpha_complete[functional_effects=="competition"]<-alpha
alpha_complete[functional_effects!="competition"]<-rep(list(c(1,1)),sum(functional_effects!="competition"))

vuln_weights <- sapply(alpha_complete, function(a) a[1])
att_weights  <- sapply(alpha_complete, function(a) a[2])

vuln <- binary_mat %*% diag(vuln_weights)
att  <- binary_mat %*% diag(att_weights)  

Competition<-matrix(0,L,L)
for(i in 1:L){
  for(j in 1:L){
    i_vec <- binary_mat[i, ]
    j_vec <- binary_mat[j, ]
    i_notin_j_idx <- which(i_vec == 1 & j_vec == 0)
    j_notin_i_idx <- which(j_vec == 1 & i_vec == 0)
    Competition[i, j] <- sum(vuln_weights[i_notin_j_idx] - 1) +
      sum(att_weights[j_notin_i_idx] - 1) + 1
  }
}

K<-rep(K_base,L)
if(length(k)>0){
  K<-matrix(binary_mat[,functional_effects=="space"]*rep(k,each=L),ncol=length(k))
  K<-rowSums(K)+rep(K_base,L)
}

print_time<-seq(from=0,to=tmax,by=tmax/Np)[-1]

parameters<-new("Parameters",
                functional_effects=functional_effects,
                I=I,
                lambda=lambda,
                mu=mu,
                Competition=Competition,
                influence=influence,
                K=K,
                print_time=print_time,
                av_lifespan=av_lifespan
                )

save(list=c("parameters",
            "starting_gen",
            "starting_fun_eff",
            "Ncells_start",
            "tmax"),
     file = "/data/Parameters.RData"
     )
rm(list=ls())


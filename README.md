
<img width="1703" height="380" alt="Opera_senza_titolo 2" src="https://github.com/user-attachments/assets/9ff1212f-aed2-4611-929e-6b40f45b791e" />

# In Silico Tumor Evolution

**An R-based simulator providing insight into clonal dynamics**

This project implements a stochastic tumor evolution simulator based on branching processes to model the clonal dynamics of cancer growth under biologically interpretable mechanisms. The simulator tracks the expansion and interaction of multiple subclones over time, accounting for selective pressures, competition, and random evolutionary events that can drive shifts in tumor composition.

At the core of the model, each subclone follows a birth–death process whose parameters depend on its *phenotype*, i.e. the collection of functional events associated with its mutations. Five main functional mechanisms are implemented:

-   **Deregulation of the proliferation program** (dividing faster/dying slower). We map into this class all the functional capabilities that have an effect on the replication process of the cells: we may therefore include here the acquired abilities in sustaining the proliferative signaling, in evading growth suppressors, in deregulating the cellular metabolism, in resisting cells death, in enabling the replicative immortality and in avoiding the immune destruction. The simplified functional effect is a a boost in the growth of the cell by either diminishing the expected time required before a cell encounters duplication -a progression through the cell cycle- and by increasing the replicative potential -immortality-, or enlarging lifespan -circumvention of the apoptotic program-. The homeostasis of cell number and the maintenance of normal tissue architecture and function is lost and a surplus in the number of births compared to the number of deaths is observed.

-   **Mutation burden augmentation** (mutating more often). Whenever the DNA is duplicated, there is a possibility of running into an error: this can be measured in terms of number of errors per cell division divided the number of base-pairs in order to obtain a standard mutation rate. There is evidence that the acquisition of the hallmarks of cancer is made possible by several enabling characteristics, among which the most prominent is the development of genomic instability that increases the mutation rate on tumor cells, as the succession of the alterations in the genomes of neoplastic cells results in the acquisition of function-altering mutations which enable the development of different capabilities.

-   **Limit evasion** (potential for expansion over defined physiological limits). Tumors are located within a body, hence they are subject to the physical constraints and to the limitation of the available resources. The infrastructure of the tissues in which cancer develops are built to bear a given number of cells. Tumor cells acquire the ability to invade nearby tissue and to disseminate, hence to escape the physiological size limits.

-   **Resource control.** The invasion process is supported by angiogenesis, which is reactivated and maintained to allow the formation of new blood vessels that help to sustain and expand neoplastic growth, and by the ability of adjusting the energy metabolism in order to fuel cell growth and division. As the capacity of the system is limited and the number of cells capable of living in such conditions is bounded, there is a natural "competition" for survival between different cells. The state of equilibrium where each cell has the same possibility to get access to the resources it need for living is lost and the ability to gain an advantage is acquired: the cell might need less nutrients for living by reprogramming the energy metabolism, it can actively harm the neighbours by subtracting nutrients, or it can become capable of exploiting resources that have been recruited by others. Yet, a combination between these "powers" might be advantageous, for instance if two cells both help the other and find resource in them, a mutualistic relationship could be created. All these events are grouped in this functional effect: those that tune how the resources are split among the cells.

-   **Passenger mutations** accumulate without direct phenotypic effect.

New mutations arise as a doubly stochastic Poisson process, with rates modulated by the parental clone’s size. Each mutation is randomly associated to a functional event with a *functional event*, which is defined by the category it belongs to (one among the five described) and a parameter that quantifies the strength of that effect. Mutations are tracked through a tree data structure that encodes parental relationships, allowing the simulator to distinguish subclones by their specific *genotypes*.

Once the events and initial conditions are defined, the simulator runs and outputs cell counts for each subpopulation over a fixed number of timesteps. Results can be downloaded or visualized in the web interface through Muller plots and clonal tree plots.\
The simulator can also generate synthetic sequencing data: at any timepoint, a subset of cells can be sampled, their mutations distributed across reads, randomly amplified, and subsampled to mimic sequencing coverage. This produces a synthetic VCF file ready for downstream analysis.

## Demo

![Demo](assets/App_DEMO.gif)

## Documentation

## Installation

Clone the git with

``` bash
  git clone git@github.com:qBioTurin/CancerSimulationInterface.git
  cd CancerSimulationInterface
```

Then run the Docker, based on your operative system:

MacOS/Linux

``` bash
 docker compose up --build
```

Windows

``` bash
 docker-compose up --build
```
Then, copy the local-host link and paste it into your browser.


## Badges

Add badges from somewhere like: [shields.io](https://shields.io/)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/) [![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/) [![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)

# Authors

-   [\@DanielaVolpatto](https://github.com/DanielaVolpatto)

-   [\@Gepiro](https://github.com/Gepiro)

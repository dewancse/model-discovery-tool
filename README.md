# Model discovery with the Physiome Model Repository

Model discovery tool is a web-based epithelial transport discovery, exploration and recommendation tool. It allows users to discover, explore and recommend CellML models of interest. This tool is deployed at this address: URL GOES HERE; as a demonstration of the capabilities described is the paper: LINK TO PREPRINT HERE?.

## Installing MDT

This tool makes use of webservices provided by [PMR](https://models.physiomeproject.org) as well as several services from the [European Bioinformatics Institute (EBI)](https://www.ebi.ac.uk/services). In oder to develop web applications which make use of services in this way, it is best to make use of a reverse proxy to ensure the web application plays nicely with modern web browsers. In this project, we use a Docker-based [NGINX](http://nginx.org/) reverse proxy for this purpose, which makes it reasonably easy to get this demonstration up and running locally as well as deploying it on various cloud platforms.

If you have Docker and git installed on your machine, then the following should get you up and running:
```
git clone https://github.com/dewancse/model-discovery-tool
docker build -f Dockerfile -t unique-name/mdt-nginx .
docker run -p 49160:8181 -d unique-name/mdt-nginx
```
And then http://localhost:49160 should work.

## MDT workflow

### Discover relevant entities

The first step is to discover entities in PMR relevant to your interests. The discovered entities are typically components or variables in CellML models, but as the annotated content on PMR continues to grow the pool of potentially relevant entities similarly grows. With our current focus on epithelial transport in the kidney, this demonstration is tuned toward the kinds of entities most commonly found in models of such systems - e.g., fluxes of solutes typically found in renal epithelial cells (sodium, potassium, ammonium...) and processes occuring in, or between, the lumen, cytosol, and interstitial compartments.

Presented in the screenshot below is an example of discovered entities from PMR for the entered text `flux of sodium`. From these results, the user can access further information on each discovered entity to help them determine which may be most relevant to their work. The additional information usually consists of the name of the model, component name and variable name; associated biological information about the entity deposited in PMR; protein names; and species and genes used during the experiments.

### Input handling

We would like users to be able to enter the "plain text" description of what they are interested in, but currently the entered text needs to be converted to one or more semantic queries executed against the PMR knowledgebase. In the future, we are looking to integrate tools such as Natural Language Processing to automate this conversion. Currently we define a dictionary of common phrases that the potential users of renal epithelial cell models might be interested in and use that to map the entered text to the semantic queries. Therefore, mapping follows the *exact match* principle. It is case insenstitive and users have to include the following terms when searching for a model:

| Physical entity | Physical process | Solutes |
| --- | --- | --- |
| `concentration` | `flux` | sodium, hydrogen, chloride, potassium, ammonium |

#### Recommender System
This system will appear as a collapsible window when the user will click a model across the apical or basolateral membrane. Presented below is an example of a CellML model entity - `flux of sodium` in the weinstein model after clicking the Weinstein model. Initially this system gives a brief description of the clicked model followed by some suggestions from the annotation in PMR. By using this system, user will get existing basolateral membranes with the sodium solute. Also, alternative models of this model from various workspaces, and related kidney models have been provided for further exploration. User can choose one of the models from this system as a replacement of the clicked model.

<center><img src=public/img/UseCaseDiagram.png /></center>

### Accessibility
The application is accessible by navigating::
```
  https://dewancse.github.io/model-discovery-tool/public/index.html Or https://ancient-inlet-34285.herokuapp.com/
```

### Programming Language
- JavaScript
- SPARQL
- Node.js

### Limitations
We will implement Unit testing and Functional testing to make sure the code is functioning as expected.

### List of contributors
- Dewan Sarwar
- David Nickerson

### Licencing
MIT license!

### Acknowledgements
This project is supported by the MedTech Centre of Research Excellence (MedTech CoRE), the Aotearoa Foundation, and the Auckland Bioengineering Institute.

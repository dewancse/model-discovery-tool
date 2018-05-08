### Epithelial Discovery Tool (EDT)
Epithelial discovery tool is a web-based epithelial transport discovery, exploration and recommendation tool. It allows users to discover, explore and recommend computational models for investigating their experimental or clinical hypotheses.

### Installing EDT
Please do the following steps to clone the EDT in your workspace:

- git clone https://github.com/dewancse/use-case-application.git
- run the "server.js" with this command: "node ./src/js/server.js"
- open "index.html" in the browser
- install "CORS Toggle" to deal with cross browser origin issue.
- if you change something in any js files of the project, you need to execute webpack with this command: "webpack --progress --profile" 

### EDT workflow

#### Discover CellML Models
Presented below screenshot is an example of discovered models from the annotated information in the Physiome Model Repository (PMR) for a search term `flux of sodium`. From this, user can analyse CellML model entity which consists of name of the model, component name and variable name; biological annotation deposited in PMR; protein name; and species and genes used during the experiments.

#### Input requirements
We have maintained a dictionary as name and value pairs to map searched text with URIs, without applying Natural Language Processing technique. However, this would be integrated later to make this process dynamic.

Therefore, mapping follows `exact match` principle. It is case insenstitive and users have to include the following terms when searching for a model:

| Physical entity | Physical process | Solutes |
| --- | --- | --- |
| `concentration` | `flux` | sodium, hydrogen, chloride, potassium, ammonium |

#### Recommender System
This system will appear as a collapsible window when the user will click a model across the apical or basolateral membrane. Presented below is an example of a CellML model entity - `flux of sodium` in the weinstein model after clicking the Weinstein model. Initially this system gives a brief description of the clicked model followed by some suggestions from the annotation in PMR. By using this system, user will get existing basolateral membranes with the sodium solute. Also, alternative models of this model from various workspaces, and related kidney models have been provided for further exploration. User can choose one of the models from this system as a replacement of the clicked model.

<center><img src=src/img/UseCaseDiagram.png /></center>

### Accessibility
The application is accessible by navigating::
```
  https://dewancse.github.io/use-case-application/src/index.html
```

### Programming Language
- JavaScript
- SPARQL

### Limitations
We will implement Unit testing and Functional testing to make sure the code is functioning as expected.

### List of contributors
- Dewan Sarwar
- Tommy Yu
- David Nickerson

### Licencing
MIT license!

### Acknowledgements
This project is supported by the MedTech Centre of Research Excellence (MedTech CoRE) and the Auckland Bioengineering Institute.
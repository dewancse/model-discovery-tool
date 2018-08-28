### Model Discovery Tool (MDT)
Model discovery tool is a web-based epithelial transport discovery, exploration and recommendation tool. It allows users to discover, explore and recommend CellML models of interest.

### Installing MDT

## Docker
```
docker build -f Dockerfile.nginx -t andre/mdt-nginx .
docker run -p 49160:80 -d andre/mdt-nginx --name mdt-nginx
```
And then http://localhost:49160 should work.

Please do the following steps to install the MDT in your workspace:

- `git clone https://github.com/dewancse/model-discovery-tool.git`
- `npm install` to install packages
- `npm start` to run server.js
- Open `http://127.0.0.1:8080/` in the browser to start index.html home page

### MDT workflow

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
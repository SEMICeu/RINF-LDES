# Mappings

YARRRML mapping from XML to RDF, checking the YARRRRML mapping generated originally from the DB.

Vocabulary: https://data-interop.era.europa.eu/era-vocabulary/

**IRI:** http://data.europa.eu/949/Track
## Mappings list:

- [x] RINF-contact-line-systems.yml 
- [x] RINF-etcs-levels.yml
- [x] RINF-link-meso-micro.yml
- [x] RINF-meso-net-elements.yml
- [x] RINF-meso-net-relations.yml
- [x] RINF-micro-net-elements.yml
- [x] RINF-micro-net-relations.yml
- [x] RINF-national-lines.yml
- [x] RINF-op-applicability.yml
- [x] RINF-op-tracks.yml
- [x] RINF-operational-points.yml
- [x] RINF-platforms.yml
- [x] RINF-sections-of-line.yml
- [x] RINF-sidings.yml
- [x] RINF-sol-not-applicable.yml
- [x] RINF-sol-not-yet-available.yml
- [x] RINF-sol-tracks.yml
- [x] RINF-train-detection-systems.yml
- [x] RINF-tunnels.yml



- ##  OPTrack: Running track (1.2.1)


This concept is represented a running track that is used for train service movements(Defined  in the ontology).

**IRI:** http://data.europa.eu/949/Track



| `Source` (XML values)                    | `Target(RDF Property)` | Required |
| :--------------------------------------- | ---------------------- | -------- |
| `<UniqueOPID/>_<OPTrackIdentification/>` | era:Track              | Required |
| `<UniqueOPID/>_<OPTrackIdentification/>` | rdfs:label             | Required |
| `<OPTrackIMCode/>`                       | era:imCode             | Required |
| `<OPTrackIdentification/>`               | era:trackId            | Required |



Spain(ES) XML Dataset :


```xml
<OperationalPoint ValidityDateStart="2015-11-19">
	<OPName Value="MUSKIZ"/>
	<UniqueOPID Value="ES13506"/>
	...
	<OPTrack>
		<OPTrackIMCode Value="0071"/>
		<OPTrackIdentification Value="1200 1"/>
		....
	<OPTrack>
</OperationalPoint>  
```



Operation Track Mapping([YARRRML](https://rml.io/yarrrml/tutorial/getting-started/) Spec):

```yaml
prefixes:
  era: "http://data.europa.eu/949/"
  rdfs: "http://www.w3.org/2000/01/rdf-schema#"
op-track:
  sources:
    - op-source
  s: http://data.europa.eu/949/functionalInfrastructure/tracks/$(UniqueOPID/@Value)_$(OPTrack/OPTrackIdentification/@Value)
  po:
    - [a, era:Track]
    - [rdfs:label, $(UniqueOPID/@Value)-$(OPTrack/OPTrackIdentification/@Value)]
    - [era:imCode, $(OPTrack/OPTrackIMCode/@Value)]
    - [era:trackId, $(OPTrack/OPTrackIdentification/@Value)]
```



RDF generated:

```bash
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix era: <http://data.europa.eu/949/> .

<http://data.europa.eu/949/functionalInfrastructure/tracks/ES13506_1200%201>
  a <http://data.europa.eu/949/Track> ;
  rdfs:label "ES13506-1200 1" ;
  era:imCode "0071" ;
  era:trackId "1200 1" .
```



Query Validate:  This query was validated on production:  https://linked.ec-dataplatform.eu/sparql

[Link](https://linked.ec-dataplatform.eu/sparql?default-graph-uri=&query=PREFIX+era%3A+%3Chttp%3A%2F%2Fdata.europa.eu%2F949%2F%3E%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0D%0APREFIX+wgs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0APREFIX+geosparql%3A+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23%3E%0D%0ASELECT+*+WHERE+%7B%0D%0A+%3Chttp%3A%2F%2Fdata.europa.eu%2F949%2FfunctionalInfrastructure%2Ftracks%2FES13506_1200%25201%3E+a+%3Chttp%3A%2F%2Fdata.europa.eu%2F949%2FTrack%3E+%3B%0D%0A+rdfs%3Alabel+%3Flabel%3B%0D%0A+era%3AimCode+%3FimCode+%3B%0D%0A+era%3AtrackId+%3FtrackId+.%0D%0A%7D&should-sponge=&format=text%2Fhtml&timeout=0)

```sql
PREFIX era: <http://data.europa.eu/949/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT * WHERE {
 <http://data.europa.eu/949/functionalInfrastructure/tracks/ES13506_1200%201> a <http://data.europa.eu/949/Track> ;
 rdfs:label ?label;
 era:imCode ?imCode ;
 era:trackId ?trackId .
}
```



- ##  Operational-points: (1.2 )

| `Source` (XML values) | `Target(RDF Property)` | Required |
| :-------------------- | ---------------------- | -------- |
| `<UniqueOPID/>`       | era:OperationalPoint   | Required |
| `<OPName/>`           | rdfs:label             | Required |
| `<OPName/>`           | era:opName             | Required |
| `<UniqueOPID/>`       | era:uopid              | Required |

Spain(ES) XML Dataset :

```xml
<OperationalPoint ValidityDateStart="2015-11-19">
        <OPName Value="MUSKIZ"/>
        <UniqueOPID Value="ES13506"/>
        <OPTafTapCode IsApplicable="NYA"/>
        <OPType Value="20" OptionalValue="small station"/>
        <OPGeographicLocation Longitude="-3.1124000" Latitude="43.3214000"/>
        <OPRailwayLocation Kilometer="12.847" NationalIdentNum="ESL722001200"/>
        <OPTrack>
            ...
        </OPTrack>
    </OperationalPoint>
```

Operational point Mapping([YARRRML](https://rml.io/yarrrml/tutorial/getting-started/) Spec):

```YAML
  operational-point:
    sources:
      - op-source
    s: http://data.europa.eu/949/functionalInfrastructure/operationalPoints/$(UniqueOPID/@Value)
    po:
      - [a, era:OperationalPoint]
      - [rdfs:label, $(OPName/@Value)]
      - [era:opName, $(OPName/@Value)] # 1.2.0.0.0.1
      - [era:uopid, $(UniqueOPID/@Value)] # 1.2.0.0.0.2
      - [era:tafTAPCode,"$(OPTafTapCode[@IsApplicable='Y']/@Value)"] # 1.2.0.0.0.3

```

RDF generated:

```bash
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix era: <http://data.europa.eu/949/> .

<http://data.europa.eu/949/functionalInfrastructure/operationalPoints/ES13506>
  a <http://data.europa.eu/949/OperationalPoint> ;
  rdfs:label "MUSKIZ" ;
  era:opName "MUSKIZ" ;
  era:uopid "ES13506" .
```



- ##  National-lines: (1.1.0.0.0.2)

| `Source` (XML values)      | `Target(RDF Property)`  | Required |
| :------------------------- | ----------------------- | -------- |
| `<SOLLineIdentification/>` | era:NationalRailwayLine | Required |
| `<SOLLineIdentification/>` | rdfs:label              | Required |


Spain(ES) XML Dataset :

```xml
<SectionOfLine>
        <SOLIMCode Value="0071"/>
        <SOLLineIdentification Value="ESL206002610"/>
        <SOLOPStart Value="ES78400"/>
        <SOLOPEnd Value="ESA7510"/>
        <SOLLength Value="0.99"/>
        <SOLNature Value="10" OptionalValue="Regular SoL"/>
        <SOLTrack>
            <SOLTrackIdentification Value="U"/>
            ... 
        </SOLTrack>
    </SectionOfLine>
```

National line Mapping([YARRRML](https://rml.io/yarrrml/tutorial/getting-started/) Spec):

```yaml
  line-national-ids:
    sources:
      - nl-source
    s: http://data.europa.eu/949/functionalInfrastructure/nationalLines/$(SOLLineIdentification/@Value)
    po:
      - [a, era:NationalRailwayLine]
      - [rdfs:label, "$(SOLLineIdentification/@Value)"]
      - p: era:inCountry
        o:
          - mapping: eu-country
            condition:
              function: equal
              parameters:
                - [str1, $(parent::RINFData/MemberStateCode/@Code)]
                - [str2, $(code)]

```

RDF generated:

```bash
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix era: <http://data.europa.eu/949/> .

<http://data.europa.eu/949/functionalInfrastructure/nationalLines/ESL206002610>
  a <http://data.europa.eu/949/NationalRailwayLine> ;
  rdfs:label "ESL206002610" ;
  era:inCountry <http://publications.europa.eu/resource/authority/country/ESP> .
```



- ##  Sections-of-line: (1.1)

| `Source` (XML values)                                | `Target(RDF Property)` | Required |
| :--------------------------------------------------- | ---------------------- | -------- |
| `<SOLLineIdentification/>_<SOLOPStart/>_<SOLOPEnd/>` | era:SectionOfLine      | Required |
| `<SOLOPStart/>`                                      | era:opStart            | Required |
| `<SOLOPStart/>`                                      | era:opEnd              | Required |


Spain(ES) XML Dataset :

```xml
<SectionOfLine>
        <SOLIMCode Value="0071"/>
        <SOLLineIdentification Value="ESL206002610"/>
        <SOLOPStart Value="ES78400"/>
        <SOLOPEnd Value="ESA7510"/>
        <SOLLength Value="0.99"/>
        <SOLNature Value="10" OptionalValue="Regular SoL"/>
        <SOLTrack>
            <SOLTrackIdentification Value="U"/>
            ... 
        </SOLTrack>
    </SectionOfLine>
```

Sections-of-line Mapping([YARRRML](https://rml.io/yarrrml/tutorial/getting-started/) Spec):

```yaml
  sections-of-line:
    sources:
      - seol-source
    s: http://data.europa.eu/949/functionalInfrastructure/sectionsOfLine/$(SOLLineIdentification/@Value)_$(SOLOPStart/@Value)_$(SOLOPEnd/@Value)
    po:
      - [a, era:SectionOfLine]
      - [rdfs:label, $(SOLLineIdentification/@Value)_$(SOLOPStart/@Value)_$(SOLOPEnd/@Value)]
      - [era:imCode, $(SOLIMCode/@Value)] # 1.1.0.0.0.1
      - [era:opStart, http://data.europa.eu/949/functionalInfrastructure/operationalPoints/$(SOLOPStart/@Value)~iri] 
      - [era:opEnd, http://data.europa.eu/949/functionalInfrastructure/operationalPoints/$(SOLOPEnd/@Value)~iri] # 1.1.0.0.0.4
      - [era:length, "$(SOLLength/@Value*1000), xsd:double"]

```

RDF generated:

```bash
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix era: <http://data.europa.eu/949/> .

<http://data.europa.eu/949/functionalInfrastructure/sectionsOfLine/ESL206002610_ES78400_ESA7510>
  a <http://data.europa.eu/949/SectionOfLine> ;
  rdfs:label "ESL206002610_ES78400_ESA7510" ;
  era:imCode "0071" ;
  era:lineNationalId <http://data.europa.eu/949/functionalInfrastructure/nationalLines/ESL206002610> ;
  era:opStart <http://data.europa.eu/949/functionalInfrastructure/operationalPoints/ES78400> ;
  era:opEnd <http://data.europa.eu/949/functionalInfrastructure/operationalPoints/ESA7510> ;
  era:length "990, xsd:double" ;
  era:hasAbstraction <http://data.europa.eu/949/topology/netElements/ESL206002610_ES78400_ESA7510> .
```


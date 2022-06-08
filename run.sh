#!/bin/bash
mongod &
cd ..
git clone https://github.com/julianrojas87/rmlmapper-java.git
cd rmlmapper-java
mvn install -DskipTests=true
cp target/*-all.jar ../rinf-ldes/rmlmapper-5.0.0.jar
cd ..
cd rinf-ldes
node bin/rinf-ldes.js
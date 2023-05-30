// This class contains two methods ("split" and "combine") that translate a JSON object in ISA Metadata Framework format back and
// forth to an ElasticSearch compatible format.
// This is done by replacing or removing fields typed by "anyOF" with uniquely typed fields.

class AnyOfSolver {

    /**
     * Splits fields typed by "anyOf" into multiple fields, suffixed with their type.
     *
     * @param jsonObject as Investigation file
     */
    split(jsonObject) {
        // No return needed - Call by Reference
        this.investigationSchema(jsonObject, true);
    }

    /**
     * Removes all fields with type suffixes by a field of type "anyOf".
     *
     * @param jsonObject as Investigation file
     */
    combine(jsonObject) {
        // No return needed - Call by Reference
        this.investigationSchema(jsonObject, false);
    }

    investigationSchema(jsonObject, isSplit) {

        if (jsonObject.hasOwnProperty('studies')) {
            for (let studyCounter = 0; studyCounter < jsonObject.studies.length; studyCounter++) {
                this.studySchema(jsonObject.studies[studyCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('publications')) {
            for (let publicationCounter = 0; publicationCounter < jsonObject.publications.length; publicationCounter++) {
                this.publicationSchema(jsonObject.publications[publicationCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('people')) {
            for (let peopleCounter = 0; peopleCounter < jsonObject.people.length; peopleCounter++) {
                this.personSchema(jsonObject.people[peopleCounter], isSplit);
            }
        }
    }

    studySchema(jsonObject, isSplit) {
        if (jsonObject.hasOwnProperty('assays')) {
            for (let assayCounter = 0; assayCounter < jsonObject.assays.length; assayCounter++) {
                this.assaySchema(jsonObject.assays[assayCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('materials') && jsonObject.materials.hasOwnProperty('samples')) {
            for (let sampleCounter = 0; sampleCounter < jsonObject.materials.samples.length; sampleCounter++) {
                this.sampleSchema(jsonObject.materials.samples[sampleCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('protocols')) {
            for (let protocolCounter = 0; protocolCounter < jsonObject.protocols.length; protocolCounter++) {
                this.protocolSchema(jsonObject.protocols[protocolCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('characteristicCategories')) {
            for (let characteristicCategoryCounter = 0; characteristicCategoryCounter < jsonObject.characteristicCategories.length; characteristicCategoryCounter++) {
                this.materialAttributeSchema(jsonObject.characteristicCategories[characteristicCategoryCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('materials') && jsonObject.materials.hasOwnProperty('otherMaterials')) {
            for (let otherMaterialCounter = 0; otherMaterialCounter < jsonObject.materials.otherMaterials.length; otherMaterialCounter++) {
                this.materialSchema(jsonObject.materials.otherMaterials[otherMaterialCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('materials') && jsonObject.materials.hasOwnProperty('sources')) {
            for (let sourceCounter = 0; sourceCounter < jsonObject.materials.sources.length; sourceCounter++) {
                this.sourceSchema(jsonObject.materials.sources[sourceCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('studyDesignDescriptors')) {
            for (let studyDesignDescriptorCounter = 0; studyDesignDescriptorCounter < jsonObject.studyDesignDescriptors.length; studyDesignDescriptorCounter++) {
                this.ontologyAnnotationSchema(jsonObject.studyDesignDescriptors[studyDesignDescriptorCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('unitCategories')) {
            for (let unitCategoryCounter = 0; unitCategoryCounter < jsonObject.unitCategories.length; unitCategoryCounter++) {
                this.ontologyAnnotationSchema(jsonObject.unitCategories[unitCategoryCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('publications')) {
            for (let publicationCounter = 0; publicationCounter < jsonObject.publications.length; publicationCounter++) {
                this.publicationSchema(jsonObject.publications[publicationCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('factors')) {
            for (let factorCounter = 0; factorCounter < jsonObject.factors.length; factorCounter++) {
                this.factorSchema(jsonObject.factors[factorCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('processSequence')) {
            for (let processSequenceCounter = 0; processSequenceCounter < jsonObject.processSequence.length; processSequenceCounter++) {
                this.processSchema(jsonObject.processSequence[processSequenceCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('people')) {
            for (let peopleCounter = 0; peopleCounter < jsonObject.people.length; peopleCounter++) {
                this.personSchema(jsonObject.people[peopleCounter], isSplit);
            }
        }
    }

    assaySchema(jsonObject, isSplit) {
        if (jsonObject.hasOwnProperty('materials') && jsonObject.materials.hasOwnProperty('samples')) {
            for (let sampleCounter = 0; sampleCounter < jsonObject.materials.samples.length; sampleCounter++) {
                this.sampleSchema(jsonObject.materials.samples[sampleCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('characteristicCategories')) {
            for (let characteristicCategoryCounter = 0; characteristicCategoryCounter < jsonObject.characteristicCategories.length; characteristicCategoryCounter++) {
                this.materialAttributeSchema(jsonObject.characteristicCategories[characteristicCategoryCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('measurementType')) {
            this.ontologyAnnotationSchema(jsonObject.measurementType, isSplit);
        }

        if (jsonObject.hasOwnProperty('technologyType') && jsonObject.technologyType.hasOwnProperty('ontologyAnnotation')) {
            this.ontologyAnnotationSchema(jsonObject.technologyType.ontologyAnnotation, isSplit);
        }

        if (jsonObject.hasOwnProperty('unitCategories')) {
            for (let unitCategoryCounter = 0; unitCategoryCounter < jsonObject.unitCategories.length; unitCategoryCounter++) {
                this.ontologyAnnotationSchema(jsonObject.unitCategories[unitCategoryCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('otherMaterials')) {
            for (let otherMaterialCounter = 0; otherMaterialCounter < jsonObject.otherMaterials.length; otherMaterialCounter++) {
                this.materialSchema(jsonObject.otherMaterials[otherMaterialCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('processSequence')) {
            for (let processSequenceCounter = 0; processSequenceCounter < jsonObject.processSequence.length; processSequenceCounter++) {
                this.processSchema(jsonObject.processSequence[processSequenceCounter], isSplit);
            }
        }
    }

    processSchema(jsonObject, isSplit) {
        if (isSplit) {
            let counter = 0;

            if (jsonObject.hasOwnProperty('inputs')) {
                for (let inputCounter = 0; inputCounter < jsonObject.inputs.length; inputCounter++) {
                    const element = jsonObject.inputs[inputCounter];
                    const result = this.sourceSampleDataMaterial(element);
                    element.counter = counter;

                    if (result.includes('SAMPLE')) {
                        if (!jsonObject.hasOwnProperty('inputs_sample')) {
                            jsonObject.inputs_sample = [];
                        }

                        this.sampleSchema(element, isSplit);
                        jsonObject.inputs_sample.push(element);

                    } else if (result.includes('SOURCE')) {
                        if (!jsonObject.hasOwnProperty('inputs_source')) {
                            jsonObject.inputs_source = [];
                        }

                        this.sourceSchema(element, isSplit);
                        jsonObject.inputs_source.push(element);

                    } else if (result.includes('DATA')) {
                        if (!jsonObject.hasOwnProperty('inputs_data')) {
                            jsonObject.inputs_data = [];
                        }

                        jsonObject.inputs_data.push(element);

                    } else if (result.includes('MATERIAL')) {
                        if (!jsonObject.hasOwnProperty('inputs_material')) {
                            jsonObject.inputs_material = [];
                        }

                        this.materialSchema(element, isSplit);
                        jsonObject.inputs_material.push(element);
                    }

                    counter++;
                }
                delete jsonObject.inputs;
            }

            if (jsonObject.hasOwnProperty('outputs')) {
                for (let outputCounter = 0; outputCounter < jsonObject.outputs.length; outputCounter++) {
                    const element = jsonObject.outputs[outputCounter];
                    const result = this.sourceSampleDataMaterial(element);
                    jsonObject.outputs[outputCounter].counter = counter;

                    if (result.includes('SAMPLE')) {
                        if (!jsonObject.hasOwnProperty('outputs_sample')) {
                            jsonObject.outputs_sample = [];
                        }

                        this.sampleSchema(element, isSplit);
                        jsonObject.outputs_sample.push(element);

                    } else if (result.includes('DATA')) {
                        if (!jsonObject.hasOwnProperty('outputs_data')) {
                            jsonObject.outputs_data = [];
                        }

                        jsonObject.outputs_data.push(element);

                    } else if (result.includes('MATERIAL')) {
                        if (!jsonObject.hasOwnProperty('outputs_material')) {
                            jsonObject.outputs_material = [];
                        }

                        this.materialSchema(element, isSplit);
                        jsonObject.outputs_material.push(element);
                    }

                    counter++;
                }
                delete jsonObject.outputs;
            }
        } else {
            const tmpInputs = [];
            const tmpOutputs = [];

            if (jsonObject.hasOwnProperty('inputs_sample')) {
                for (let inputs_sampleCounter = 0; inputs_sampleCounter < jsonObject.inputs_sample.length; inputs_sampleCounter++) {
                    this.sampleSchema(jsonObject.inputs_sample[inputs_sampleCounter], isSplit);
                }

                Array.prototype.push.apply(tmpInputs, jsonObject.inputs_sample);
                delete jsonObject.inputs_sample;
            }

            if (jsonObject.hasOwnProperty('inputs_source')) {
                for (let inputs_sourceCounter = 0; inputs_sourceCounter < jsonObject.inputs_source.length; inputs_sourceCounter++) {
                    this.sourceSchema(jsonObject.inputs_source[inputs_sourceCounter], isSplit);
                }

                Array.prototype.push.apply(tmpInputs, jsonObject.inputs_source);
                delete jsonObject.inputs_source;
            }

            if (jsonObject.hasOwnProperty('inputs_data')) {
                Array.prototype.push.apply(tmpInputs, jsonObject.inputs_data);
                delete jsonObject.inputs_data;
            }

            if (jsonObject.hasOwnProperty('inputs_material')) {
                for (let inputs_materialCounter = 0; inputs_materialCounter < jsonObject.inputs_material.length; inputs_materialCounter++) {
                    this.materialSchema(jsonObject.inputs_material[inputs_materialCounter], isSplit);
                }

                Array.prototype.push.apply(tmpInputs, jsonObject.inputs_material);
                delete jsonObject.inputs_material;
            }

            if (jsonObject.hasOwnProperty('outputs_sample')) {
                for (let outputs_sampleCounter = 0; outputs_sampleCounter < jsonObject.outputs_sample.length; outputs_sampleCounter++) {
                    this.sampleSchema(jsonObject.outputs_sample[outputs_sampleCounter], isSplit);
                }

                Array.prototype.push.apply(tmpOutputs, jsonObject.outputs_sample);
                delete jsonObject.outputs_sample;
            }

            if (jsonObject.hasOwnProperty('outputs_data')) {
                Array.prototype.push.apply(tmpOutputs, jsonObject.outputs_data);
                delete jsonObject.outputs_data;
            }

            if (jsonObject.hasOwnProperty('outputs_material')) {
                for (let outputs_materialCounter = 0; outputs_materialCounter < jsonObject.outputs_material.length; outputs_materialCounter++) {
                    this.materialSchema(jsonObject.outputs_material[outputs_materialCounter], isSplit);
                }

                Array.prototype.push.apply(tmpOutputs, jsonObject.outputs_material);
                delete jsonObject.outputs_material;
            }

            const counterList = [];

            for (let tmpInputCounter = 0; tmpInputCounter < tmpInputs.length; tmpInputCounter++) {
                if (!jsonObject.hasOwnProperty('inputs')) {
                    jsonObject.inputs = [];
                }

                if (!counterList.includes(tmpInputs[tmpInputCounter].counter)) {
                    counterList.push(tmpInputs[tmpInputCounter].counter);
                    delete tmpInputs[tmpInputCounter].counter;
                    jsonObject.inputs.push(tmpInputs[tmpInputCounter]);
                }
            }

            for (let tmpOutputCounter = 0; tmpOutputCounter < tmpOutputs.length; tmpOutputCounter++) {
                if (!jsonObject.hasOwnProperty('outputs')) {
                    jsonObject.outputs = [];
                }

                if (!counterList.includes(tmpOutputs[tmpOutputCounter].counter)) {
                    counterList.push(tmpOutputs[tmpOutputCounter].counter);
                    delete tmpOutputs[tmpOutputCounter].counter;
                    jsonObject.outputs.push(tmpOutputs[tmpOutputCounter]);
                }
            }
        }

        if (jsonObject.hasOwnProperty('executesProtocol')) {
            this.protocolSchema(jsonObject.executesProtocol, isSplit);
        }

        if (jsonObject.hasOwnProperty('parameterValues')) {
            for (let parameterValueCounter = 0; parameterValueCounter < jsonObject.parameterValues.length; parameterValueCounter++) {
                this.processParameterValueSchema(jsonObject.parameterValues[parameterValueCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('previousProcess')) {
            this.processSchema(jsonObject.previousProcess, isSplit);
        }

        if (jsonObject.hasOwnProperty('nextProcess')) {
            this.processSchema(jsonObject.nextProcess, isSplit);
        }
    }

    sampleSchema(jsonObject, isSplit) {
        if (jsonObject.hasOwnProperty('characteristics')) {
            for (let characteristicCounter = 0; characteristicCounter < jsonObject.characteristics.length; characteristicCounter++) {
                this.materialAttributeValueSchema(jsonObject.characteristics[characteristicCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('derivesFrom')) {
            for (let derivesFromCounter = 0; derivesFromCounter < jsonObject.derivesFrom.length; derivesFromCounter++) {
                this.sourceSchema(jsonObject.derivesFrom[derivesFromCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('factorValues')) {
            for (let factorValueCounter = 0; factorValueCounter < jsonObject.factorValues.length; factorValueCounter++) {
                this.factorValueSchema(jsonObject.factorValues[factorValueCounter], isSplit);
            }
        }
    }

    personSchema(jsonObject, isSplit) {
        if (jsonObject.hasOwnProperty('roles')) {
            for (let roleCounter = 0; roleCounter < jsonObject.roles.length; roleCounter++) {
                this.ontologyAnnotationSchema(jsonObject.roles[roleCounter], isSplit);
            }
        }
    }

    factorValueSchema(jsonObject, isSplit) {
        if (isSplit) {
            if (jsonObject.hasOwnProperty('value')) {
                if (typeof jsonObject.value === 'string') {
                    jsonObject.value_string = jsonObject.value;
                } else if (typeof jsonObject.value === 'number') {
                    jsonObject.value_number = jsonObject.value;
                } else {
                    jsonObject.value_ontologyAnnotation = jsonObject.value;
                    this.ontologyAnnotationSchema(jsonObject.value_ontologyAnnotation, isSplit);
                }
                delete jsonObject.value;
            }
        } else {
            if (jsonObject.hasOwnProperty('value_string')) {
                jsonObject.value = jsonObject.value_string;
                delete jsonObject.value_string;
            } else if (jsonObject.hasOwnProperty('value_number')) {
                jsonObject.value = jsonObject.value_number;
                delete jsonObject.value_number;
            } else if (jsonObject.hasOwnProperty('value_ontologyAnnotation')) {
                this.ontologyAnnotationSchema(jsonObject.value_ontologyAnnotation, isSplit);
                jsonObject.value = jsonObject.value_ontologyAnnotation;
                delete jsonObject.value_ontologyAnnotation;
            }
        }

        if (jsonObject.hasOwnProperty('unit')) {
            this.ontologyAnnotationSchema(jsonObject.unit, isSplit);
        }

        if (jsonObject.hasOwnProperty('category')) {
            this.factorSchema(jsonObject.category, isSplit);
        }
    }

    materialSchema(jsonObject, isSplit) {
        if (jsonObject.hasOwnProperty('characteristics')) {
            for (let characteristicCounter = 0; characteristicCounter < jsonObject.characteristics.length; characteristicCounter++) {
                this.materialAttributeValueSchema(jsonObject.characteristics[characteristicCounter], isSplit);
            }
        }

        if (jsonObject.hasOwnProperty('derivesFrom')) {
            for (let derivesFromCounter = 0; derivesFromCounter < jsonObject.derivesFrom.length; derivesFromCounter++) {
                this.materialSchema(jsonObject.derivesFrom[derivesFromCounter], isSplit);
            }
        }
    }

    factorSchema(jsonObject, isSplit) {
        if (jsonObject.hasOwnProperty('factorType')) {
            this.ontologyAnnotationSchema(jsonObject.factorType, isSplit);
        }
    }

    publicationSchema(jsonObject, isSplit) {
        if (jsonObject.hasOwnProperty('status')) {
            this.ontologyAnnotationSchema(jsonObject.status, isSplit);
        }
    }

    processParameterValueSchema(jsonObject, isSplit) {
        if (isSplit) {
            if (jsonObject.hasOwnProperty('value')) {
                if (typeof jsonObject.value === 'string') {
                    jsonObject.value_string = jsonObject.value;
                } else if (typeof jsonObject.value === 'number') {
                    jsonObject.value_number = jsonObject.value;
                } else {
                    jsonObject.value_ontologyAnnotation = jsonObject.value;
                    this.ontologyAnnotationSchema(jsonObject.value_ontologyAnnotation, isSplit);
                }
                delete jsonObject.value;
            }
        } else {
            if (jsonObject.hasOwnProperty('value_string')) {
                jsonObject.value = jsonObject.value_string;
                delete jsonObject.value_string;
            } else if (jsonObject.hasOwnProperty('value_number')) {
                jsonObject.value = jsonObject.value_number;
                delete jsonObject.value_number;
            } else if (jsonObject.hasOwnProperty('value_ontologyAnnotation')) {
                this.ontologyAnnotationSchema(jsonObject.value_ontologyAnnotation, isSplit);
                jsonObject.value = jsonObject.value_ontologyAnnotation;
                delete jsonObject.value_ontologyAnnotation;
            }
        }

        if (jsonObject.hasOwnProperty('category')) {
            this.protocolParameterSchema(jsonObject.category, isSplit);
        }

        if (jsonObject.hasOwnProperty('unit')) {
            this.ontologyAnnotationSchema(jsonObject.unit, isSplit);
        }
    }

    sourceSchema(jsonObject, isSplit) {
        if (jsonObject.hasOwnProperty('characteristics')) {
            for (let characteristicCounter = 0; characteristicCounter < jsonObject.characteristics.length; characteristicCounter++) {
                this.materialAttributeValueSchema(jsonObject.characteristics[characteristicCounter], isSplit);
            }
        }
    }

    protocolSchema(jsonObject, isSplit) {
        if (jsonObject.hasOwnProperty('protocolType')) {
            this.ontologyAnnotationSchema(jsonObject.protocolType, isSplit);
        }

        if (jsonObject.hasOwnProperty('components')) {
            for (let componentCounter = 0; componentCounter < jsonObject.components.length; componentCounter++) {
                if (jsonObject.components[componentCounter].hasOwnProperty('componentType')) {
                    this.ontologyAnnotationSchema(jsonObject.components[componentCounter].componentType, isSplit);
                }
            }
        }

        if (jsonObject.hasOwnProperty('parameters')) {
            for (let parameterCounter = 0; parameterCounter < jsonObject.parameters.length; parameterCounter++) {
                this.protocolParameterSchema(jsonObject.parameters[parameterCounter], isSplit);
            }
        }
    }

    materialAttributeValueSchema(jsonObject, isSplit) {
        if (isSplit) {
            if (jsonObject.hasOwnProperty('value')) {
                if (typeof jsonObject.value === 'string') {
                    jsonObject.value_string = jsonObject.value;
                } else if (typeof jsonObject.value === 'number') {
                    jsonObject.value_number = jsonObject.value;
                } else {
                    jsonObject.value_ontologyAnnotation = jsonObject.value;
                    this.ontologyAnnotationSchema(jsonObject.value_ontologyAnnotation, isSplit);
                }
                delete jsonObject.value;
            }
        } else {
            if (jsonObject.hasOwnProperty('value_string')) {
                jsonObject.value = jsonObject.value_string;
                delete jsonObject.value_string;
            } else if (jsonObject.hasOwnProperty('value_number')) {
                jsonObject.value = jsonObject.value_number;
                delete jsonObject.value_number;
            } else if (jsonObject.hasOwnProperty('value_ontologyAnnotation')) {
                this.ontologyAnnotationSchema(jsonObject.value_ontologyAnnotation, isSplit);
                jsonObject.value = jsonObject.value_ontologyAnnotation;
                delete jsonObject.value_ontologyAnnotation;
            }
        }

        if (jsonObject.hasOwnProperty('category')) {
            this.materialAttributeSchema(jsonObject.category, isSplit);
        }
    }

    protocolParameterSchema(jsonObject, isSplit) {
        if (jsonObject.hasOwnProperty('parameterName')) {
            this.ontologyAnnotationSchema(jsonObject.parameterName, isSplit);
        }
    }

    materialAttributeSchema(jsonObject, isSplit) {
        if (jsonObject.hasOwnProperty('characteristicType')) {
            this.ontologyAnnotationSchema(jsonObject.characteristicType, isSplit);
        }
    }

    ontologyAnnotationSchema(jsonObject, isSplit) {
        if (isSplit) {
            if (jsonObject.hasOwnProperty('annotationValue')) {
                if (typeof jsonObject.annotationValue === 'string') {
                    jsonObject.annotationValue_string = jsonObject.annotationValue;
                } else {
                    jsonObject.annotationValue_number = jsonObject.annotationValue;
                }
                delete jsonObject.annotationValue;
            }
        } else {
            if (jsonObject.hasOwnProperty('annotationValue_string')) {
                jsonObject.annotationValue = jsonObject.annotationValue_string;
                delete jsonObject.annotationValue_string;
            } else if (jsonObject.hasOwnProperty('annotationValue_number')) {
                jsonObject.annotationValue = jsonObject.annotationValue_number
                delete jsonObject.annotationValue_number
            }
        }
    }

    /**
     * Specifies all possible schema affiliations. This is needed for the "inputs" and "outputs" fields of
     * the process_schema.json.
     *
     * Returns a list with possible schema affiliations ("SAMPLE", "SOURCE", "DATA", "MATERIAL").
     */
    sourceSampleDataMaterial(jsonObject) {
        const SAMPLE = "SAMPLE";
        const SOURCE = "SOURCE";
        const DATA = "DATA";
        const MATERIAL = "MATERIAL";
        const result = [];

        if (jsonObject.hasOwnProperty('factorValues')) {
            result.push(SAMPLE);
        } else if (jsonObject.hasOwnProperty('comments')) {
            result.push(DATA);
        } else {
            if (jsonObject.hasOwnProperty('type')) {
                if (jsonObject.type === 'Extract Name' || jsonObject.type === 'Labeled Extract Name') {
                    result.push(MATERIAL);
                } else {
                    result.push(DATA);
                }
            } else {
                if (jsonObject.hasOwnProperty('derivesFrom')) {
                    if (jsonObject.derivesFrom.hasOwnProperty('type')) {
                        result.push(MATERIAL);
                    } else {
                        if (jsonObject.derivesFrom.hasOwnProperty('derivesFrom')) {
                            result.push(MATERIAL);
                        } else {
                            result.push(SAMPLE);
                            result.push(MATERIAL);
                        }
                    }
                } else {
                    if (jsonObject.hasOwnProperty('characteristics')) {
                        result.push(SOURCE);
                        result.push(SAMPLE);
                        result.push(MATERIAL);
                    } else {
                        result.push(SOURCE);
                        result.push(SAMPLE);
                        result.push(DATA);
                        result.push(MATERIAL);
                    }
                }
            }
        }
        return result;
    }
}

module.exports = AnyOfSolver;
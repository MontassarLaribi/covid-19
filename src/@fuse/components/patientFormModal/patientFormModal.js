import DateFnsUtils from "@date-io/date-fns";
import { Modal } from "@fuse";
import { Button, MenuItem } from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import * as React from "react";
import { withRouter } from "react-router-dom";
import { Recorder } from "react-voice-recorder";
import * as yup from "yup";
import QuestionEducation from "./QuestionEducation";
import LoiSnack from "../loiSnack";

const PatientSchema = yup.object().shape({
  mytel: yup
    .string()
    .matches(/^[0-9]{8}$/, "Doit être 8 chiffres")
    .required("Champ téléphone requis"),
  zipcode: yup
    .number("Nombre positif")
    .required("Champ age est requis")
    .typeError("Zip est un nombre")
    .positive("Nombre positif")
    .integer("Nombre positif"),
  nom: yup.string().required("Champ nom est requis"),
  adresse: yup.string().required("Champ adresse est requis"),
  prenom: yup.string().required("Champ prenom est requis"),
  sexe: yup.string().required("Champ sexe est requis"),
  age: yup
    .number("Nombre positif")
    .required("Champ age est requis")
    .typeError("age must be a number")
    .positive("Nombre positif")
    .integer("Nombre positif")
    .min(0)
    .max(120)
});

const PatientFormModal = ({
  staticCount,
  dynamicCount,
  modalAction,
  dataModal,
  submitFormCallback,
  updateResponse
}) => {
  const handleClose = id => {
    modalAction(id);
  };

  const getAllState = data => {
    updateResponse(data);
  };

  const handleAudioStop = data => {
    //     var reader = new FileReader();
    //  reader.readAsDataURL(data);
    //  reader.onloadend = function() {
    //      var base64data = reader.result;
    //      console.log('ssssssss',base64data);
    //  }
  };

  console.log("dynamicCount,  staticCount,", dynamicCount, staticCount);

  return (
    <>
      <Modal className="patientForm" id="PatientForm" ModalAction={modalAction}>
        <LoiSnack />
        <div className="modal-header">
          <h4>FORMULAIRE DE MALADIE</h4>
          <button onClick={() => handleClose("PatientForm")}>x</button>
        </div>
        <div className="modal-content">
          {dataModal &&
            dataModal.map((el, key) => {
              return (
                <div className="question-list" key={key}>
                  <h4>{el.label}</h4>
                  {el.questions.map((elem, i) => (
                    <QuestionEducation
                      index={i}
                      key={elem.id}
                      getState={getAllState}
                      title={elem.fr_value}
                      description={elem.ar_value}
                      {...elem}
                    />
                  ))}
                </div>
              );
            })}
          <h4 className="personnal-question-title-audio">MESSAGE VOCAL</h4>
          <div>
            <Recorder
              record={true}
              // title={"New recording"}
              showUIAudio
              handleAudioStop={data => handleAudioStop(data)}
            />
          </div>

          <h4 className="personnal-question-title">Données Personnelles</h4>
          <Formik
            initialValues={{
              email: "",
              nom: "",
              prenom: "",
              adresse: "",
              mytel: "",
              zipcode: ""
            }}
            validationSchema={PatientSchema}
            onSubmit={(values, { setSubmitting }) => {
              const caste = {
                firstName: values.prenom,
                lastName: values.nom,
                address: values.adresse,
                zipCode: values.zipcode,
                phoneNumber: values.mytel
              };
              submitFormCallback(caste);
            }}
            render={({
              resetForm,
              submitForm,
              isSubmitting,
              values,
              setFieldValue
            }) => (
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Form>
                  <div
                    style={{
                      margin: 10
                    }}
                  >
                    <Field
                      component={TextField}
                      type="text"
                      label="Nom"
                      name="nom"
                      variant="outlined"
                      style={{
                        margin: "0 12px"
                      }}
                    />
                    <Field
                      component={TextField}
                      type="text"
                      label="Prenom"
                      name="prenom"
                      variant="outlined"
                      style={{
                        margin: "0 12px"
                      }}
                    />
                  </div>
                  <div
                    style={{
                      margin: 10
                    }}
                  >
                    <Field
                      component={TextField}
                      type="text"
                      label="Adress"
                      name="adresse"
                      variant="outlined"
                      style={{
                        margin: "0 12px"
                      }}
                    />
                    <Field
                      select
                      component={TextField}
                      variant="outlined"
                      fullwidth="true"
                      style={{
                        margin: "0 12px"
                      }}
                      name="sexe"
                      id="sexe"
                      value="H"
                      inputProps={{
                        value: "H"
                      }}
                    >
                      <MenuItem value={"H"}>Homme</MenuItem>
                      <MenuItem value={"F"}>Femme</MenuItem>
                    </Field>
                  </div>
                  <div
                    style={{
                      margin: 10
                    }}
                  >
                    <Field
                      component={TextField}
                      type="text"
                      label="Numero de telephone"
                      name="mytel"
                      variant="outlined"
                      style={{
                        margin: "0 12px"
                      }}
                    />

                    <Field
                      component={TextField}
                      type="text"
                      label="Zip Code"
                      name="zipcode"
                      variant="outlined"
                      style={{
                        margin: "0 12px"
                      }}
                    />
                  </div>
                  <div className="action-buttons">
                    <Button
                      className="cancel"
                      variant="outlined"
                      color="primary"
                      disabled={isSubmitting}
                      onClick={() => {
                        resetForm();
                        handleClose("PatientForm");
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      onClick={() => {
                        if (staticCount === dynamicCount) {
                          submitForm();
                        } else {
                          alert("Merci de répondre à toutes les questions");
                        }
                      }}
                    >
                      Valider
                    </Button>
                  </div>
                </Form>
              </MuiPickersUtilsProvider>
            )}
          />
        </div>
      </Modal>
    </>
  );
};

export default withRouter(PatientFormModal);

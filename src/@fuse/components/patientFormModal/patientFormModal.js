import DateFnsUtils from "@date-io/date-fns";
import { Modal } from "@fuse";
import { Button, MenuItem } from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import * as yup from "yup";
import QuestionEducation from "./QuestionEducation";
import LoiSnack from "../loiSnack";
import { useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import IconButton from "@material-ui/core/IconButton";
import MicIcon from "@material-ui/icons/Mic";

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
  sexe: yup.string().required("Champ sexe est requis")
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

  const [audioConfig, setAudioConfig] = useState({
    status: "idle",
    mediaBlobUrl: ""
  });

  const [audio, setAudio] = useState(null);

  // TIMER START
  const [mSeconds, setMSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  function toggle() {
    setIsActive(!isActive);
  }

  function reset() {
    setMSeconds(0);
    setIsActive(false);
  }

  useEffect(() => {
    let interval = null;
    if (isActive && mSeconds < 5) {
      interval = setInterval(() => {
        setMSeconds(mSeconds => mSeconds + 1);
      }, 1000);
    } else if (!isActive && mSeconds !== 0) {
      clearInterval(interval);
    }
    if (mSeconds >= 5) {
      clearInterval(interval);
      document.getElementById("stopRecording").click();
      reset();
    }
    return () => clearInterval(interval);
  }, [isActive, mSeconds]);
  // TIMER END

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
            <ReactMediaRecorder
              audio
              onStop={async mediaBlobUrl => {
                setAudioConfig({ status: "stopped", mediaBlobUrl });
                let blob = await fetch(audioConfig.mediaBlobUrl).then(r => {
                  return r.blob();
                });
                var reader = new window.FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function() {
                  let base64 = reader.result;
                  base64 = base64.split(",")[1];
                  setAudio(base64);
                  console.log(base64);
                };
              }}
              render={({
                status,
                startRecording,
                stopRecording,
                mediaBlobUrl
              }) => {
                if (!isActive && status !== "idle") {
                  // stopRecording();
                }
                return (
                  <>
                    <label>
                      Vous avez 60 secondes pour décrire votre état et pour
                      qu'on puisse mieux vous diagnostiquer
                    </label>
                    <div style={{ textAlign: "center" }}>
                      <IconButton
                        color={isActive ? "secondary" : "primary"}
                        aria-label="record"
                        onClick={() => {
                          if (isActive) {
                            stopRecording();
                            toggle();
                          } else {
                            startRecording();
                            toggle();
                          }
                        }}
                      >
                        <MicIcon />
                      </IconButton>
                      <p>
                        {status === "recording"
                          ? "en écoute " + mSeconds + " secondes"
                          : "arreté"}
                      </p>
                      <button
                        id="stopRecording"
                        style={{ display: "none" }}
                        onClick={() => {
                          stopRecording();
                          toggle();
                        }}
                      ></button>
                      <audio
                        src={mediaBlobUrl}
                        controls
                        controlsList="nodownload"
                      />
                    </div>
                  </>
                );
              }}
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
              zipcode: "",
              sexe: "H"
            }}
            validationSchema={PatientSchema}
            onSubmit={(values, { setSubmitting }) => {
              const caste = {
                firstName: values.prenom,
                lastName: values.nom,
                address: values.adresse,
                zipCode: values.zipcode,
                phoneNumber: values.mytel,
                sexe: values.sexe,
                audio: audio
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
                      value={values.nom}
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
                      value={values.prenom}
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
                      value={values.adresse}
                      variant="outlined"
                      style={{
                        margin: "0 12px"
                      }}
                    />
                    <Field
                      select
                      component={TextField}
                      label="sexe"
                      variant="outlined"
                      fullwidth="true"
                      style={{
                        margin: "0 12px"
                      }}
                      name="sexe"
                      id="sexe"
                      value={values.sexe}
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
                      value={values.mytel}
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
                      value={values.zipcode}
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
                        submitForm();
                        // if (staticCount === dynamicCount && audio) {
                        //   submitForm();
                        // } else {
                        //   alert("Merci de répondre à toutes les questions");
                        // }
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

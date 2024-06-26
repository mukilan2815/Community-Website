import React, { useEffect, useState, useCallback } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { Edit, Delete } from "@material-ui/icons";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { END_POINT } from "../../../../../config/api";
import Loader from "../../../../../components/util/Loader";
import style from "./manage-faq.module.scss";
import { SimpleToast } from "../../../../../components/util/Toast";
import { Button2 } from "../../../../../components/util/Button/index";

export function ManageFaq() {
  const [faqs, setFaqs] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [open, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [severity, setSeverity] = useState("success");
  const [reload, setReload] = useState(false);
  const [faqObject, setFaqObject] = useState({});
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleCloseToast = useCallback(() => {
    setTimeout(() => {
      setOpenToast(false);
    }, 500);
  }, []);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const fetchAllFaq = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`${END_POINT}/faq/getFaq`);
      const data = await response.json();
      setFaqs(data.Faq);
      setIsFetching(false);
    } catch (err) {
      console.log(err.message);
      setIsFetching(false);
    }
  }, []);

  const deleteFaq = async (faqId) => {
    setIsFetching(true);
    const url = `${END_POINT}/faq/deleteFaq`;
    const body = { faqId: faqId };
    const headers = {
      "Content-Type": "application/json",
      authorization: `Bearer ${localStorage.getItem("token")}`,
    };
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setToastMessage(data.message);
      setOpenToast(true);
      setSeverity("success");
      setReload(!reload);
    } catch (error) {
      setToastMessage("Failed to delete Faq");
      setOpenToast(true);
      setSeverity("error");
    } finally {
      setIsFetching(false);
    }
  };

  const updateFaq = async (faqId, updatedFaqDetails) => {
    try {
      const response = await fetch(`${END_POINT}/faq/updateFaq`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ faqId, ...updatedFaqDetails }),
      });

      if (!response.ok) {
        throw new Error("Failed to update FAQ");
      }

      const data = await response.json();
      setToastMessage(data.message);
      setOpenToast(true);
      setSeverity("success");
      setReload((prev) => !prev);
    } catch (error) {
      console.error("Failed to update FAQ:", error.message);
      setToastMessage("Failed to update FAQ");
      setOpenToast(true);
      setSeverity("error");
    }
  };

  const handleEdit = (faqId) => {
    const editedFaq = faqs.find((faq) => faq._id === faqId);
    setFaqObject(editedFaq);
    setOpenEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (validateForm()) {
      updateFaq(faqObject._id, faqObject);
      setOpenEditDialog(false);
    }
  };

  const handleCancelEdit = () => {
    setOpenEditDialog(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!faqObject.question) {
      errors.question = "* Question is required";
    }
    if (!faqObject.answer) {
      errors.answer = "* Answer is required";
    }
    if (!faqObject.tags.length || faqObject.tags[0] === "") {
      errors.tags = "* At least one tag is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    fetchAllFaq();
  }, [fetchAllFaq, reload]);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Manage FAQ</h1>
      <div className={style["faq"]}>
        <div className={`${style["faq-block"]}`}>
          {isFetching ? (
            <Loader />
          ) : (
            faqs.map((faq) => (
              <Accordion
                key={faq._id}
                className={style["accord-dark"]}
                expanded={expanded === `panel1-${faq._id}`}
                onChange={handleChange(`panel1-${faq._id}`)}
              >
                <AccordionSummary
                  style={{ color: "white" }}
                  expandIcon={
                    <ExpandMoreIcon
                      style={{ color: "white", fontSize: "27px" }}
                    />
                  }
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <h3 className={style["faq-question"]}>
                      <i
                        className="fa fa-question-circle"
                        aria-hidden="true"
                      ></i>
                      &nbsp; &nbsp;{faq.question}
                    </h3>
                  </div>
                </AccordionSummary>
                <AccordionDetails className={style["accord-details"]}>
                  <Typography style={{ color: "white" }}>
                    {faq.answer}
                  </Typography>
                  <div className={style["btns-container"]}>
                    <Button
                      id={style["update-btn"]}
                      className={style["btns"]}
                      variant="contained"
                      endIcon={<Edit />}
                      onClick={() => handleEdit(faq._id)}
                    >
                      EDIT
                    </Button>
                    <Button
                      id={style["delete-btn"]}
                      className={style["btns"]}
                      variant="contained"
                      endIcon={<Delete />}
                      onClick={() => deleteFaq(faq._id)}
                    >
                      DELETE
                    </Button>
                  </div>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </div>
      </div>
      {faqObject && openEditDialog && (
        <div className={style["blur-background"]}>
          <div className={style["edit-dialog"]}>
            <h2 className={style["edit-dialog-heading"]}>Edit FAQ</h2>
            <div className={style["edit-form"]}>
              <label htmlFor="editedQuestion">Question:</label>
              <input
                id="editedQuestion"
                type="text"
                value={faqObject.question}
                onChange={(e) =>
                  setFaqObject({ ...faqObject, question: e.target.value })
                }
                className={style["faq-input"]}
              />
              {formErrors.question && (
                <span className={style["error"]}>{formErrors.question}</span>
              )}
              <label htmlFor="editedAnswer">Answer:</label>
              <input
                id="editedAnswer"
                type="text"
                value={faqObject.answer}
                onChange={(e) =>
                  setFaqObject({ ...faqObject, answer: e.target.value })
                }
                className={style["faq-input"]}
              />
              {formErrors.answer && (
                <span className={style["error"]}>{formErrors.answer}</span>
              )}
              <label htmlFor="editedIsActive">Is Active:</label>
              <input
                id="editedIsActive"
                type="checkbox"
                checked={faqObject.isActive}
                onChange={(e) =>
                  setFaqObject({ ...faqObject, isActive: e.target.checked })
                }
                className={style["checkbox"]}
              />
              <label htmlFor="editedTags">Tags:</label>
              <input
                id="editedTags"
                type="text"
                value={faqObject.tags.join(",")}
                onChange={(e) =>
                  setFaqObject({
                    ...faqObject,
                    tags: e.target.value.split(",").map(tag => tag.trim()),
                  })
                }
                className={style["faq-input"]}
              />
              {formErrors.tags && (
                <span className={style["error"]}>{formErrors.tags}</span>
              )}
              <div className={style["submit-btn"]}>
                <Button2
                  className={style["submit-btn-text"]}
                  label="Save"
                  type="submit"
                  onClick={handleSaveEdit}
                />
                <Button2
                  className={style["submit-btn-text"]}
                  label="Cancel"
                  type="button"
                  onClick={handleCancelEdit}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <SimpleToast
        open={open}
        message={toastMessage}
        severity={severity}
        handleCloseToast={handleCloseToast}
      />
    </div>
  );
}

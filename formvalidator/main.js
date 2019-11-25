let theErrorReport;

window.onload = function initializeApp() {
    const theForm = document.getElementById("try-out-form");
    theErrorReport = document.getElementById("error-report");
    theErrorReport.hidden = true;

    // The form-validator uses functions to check if a field has valid input.
    // This object defines which checker functions work for which form fields.
    const theFormCheckers = {
        voornaam: checkBoth(hasMinLength(3), hasMaxLength(10)),
        achternaam: message(hasMinLength(3),"te kort"),
        postcode: optional(message(isaPostCode,"niet een PC")),
        huisnummer: isRequired
    };
    theForm.addEventListener(
        "submit",
        makeFormValidator(theFormCheckers, handleFormSubmit)
    );
};

function handleFormSubmit() {
    theErrorReport.hidden = true;
    alert(
        "Alle velden zijn prima ingevuld!\nWe kunnen de data naar de server sturen..."
    );
}

// This is a checker function that is used by the validator library.
function isaPostCode(value) {
    value = value.trim();
    // The parameter to the search-method is a "regular expression". They are
    // very useful for finding complex patterns in text. The pattern below is
    // for a Dutch zip code of type 1234 AB.
    // For more info on regular expressions, see Chapter 9 of Eloquent Javascript.
    // A useful tool for visualizeing and testing them is at https://www.debuggex.com/
    const postCodePattern = /^[0-9]{4}\s*[A-Za-z]{2}$/;
    const position = value.search(postCodePattern);
    const result = position !== -1; // return value of -1 means the pattern was not found.
    console.log(`Checked postcode «${value}»:`, result);
    return result;
}

/////// UITWERKING OPDRACHT /////////////////////////////////////

// STAP 2
function hasCorrectLength(value) {
    return value.length <= 20 && value.length >= 3;
}

// STAP 3
function hasMaxLength(maxLength) {
    return function(value) {
        return value.length <= maxLength;
    };
}
function hasMinLength(minLength) {
    return function(value) {
        return value.length >= minLength;
    };
}

// STAP 4
// Deze zou wellicht beter in formValidation.js kunnen staan.
function checkBoth(checker1, checker2) {
    return function(value) {
        return checker1(value) && checker2(value);
    };
}
// BONUS:
function checkAll(...checkers) {
    return function(value) {
        for (checker of checkers) {
            if (!checker(value)) {
                return false;
            }
        }
        return true;
    };
}
//mooier zou gebruik van `every` methode zijn:
function checkAll(...checkers) {
    return function(value) {
        return checkers.every(checker => checker(value));
    };
}

//STAP 5
// Deze zou wellicht beter in formValidation.js kunnen staan.
function optional(checker) {
    return function(value) {
        return value === "" || checker(value);
    };
}

//STAP 6 - Dit alles hoort eigenlijk in formValidation.js te staan.

// Gegeven code:
function isRequired(value) {
    const result = value.trim() != "";
    return result || "Dit veld moet ingevuld worden";
}
// Oude comments verwijderd
// Let op: nieuwe parameter, en betere variabelenamen
function makeFormValidator(checkerFunctions, submitHandler, errorReporter) {
    return function validator(event) {
        event.preventDefault();

        const theForm = event.target;
        const theErrorReport = document.getElementById("error-report");

        const fieldsCollection = theForm.getElementsByTagName(`input`);
        const fieldsArray = Array.from(fieldsCollection);

        console.log("---");
        // code hieronder komt uit assignment text, maar dan met
        // betekenisvolle variabelenamen.
        const fieldsToCheck = fieldsArray.filter(inputElement => {
            return checkerFunctions[inputElement.name] !== undefined;
        });
        const namedCheckResults = fieldsToCheck.map(inputElement => {
            const fieldName = inputElement.name;
            const checker = checkerFunctions[inputElement.name];
            const checkResult = checker(inputElement.value);
            return [fieldName, checkResult];
        });
        const checkFailures = namedCheckResults.filter(
            ([fName, result]) => result !== true
        );

        if (checkFailures.length == 0) {
            submitHandler(); // Everything checked out OK, call success-callback.
        } else {
            errorReporter(checkFailures);
        }
    };
}
// Onderstaande code komt uit assignmenttekst, geen wijzigingen.
// In de comments mijn antwoorden op de vraag om tussenresultaten
// te beschrijven.
function handleErrors(checkerFailures) {
    theErrorReport.hidden = false;
    const errorList = document.getElementById("error-messages");
    errorList.innerHTML = "";

    checkerFailures
        .map(([name, failure]) => {
            if (failure !== false) {
                return [name, failure];
            } else {
                return [name, "Dit veld is niet correct ingevuld"];
            }
        })
        // bovenstaande map() levert zelfde lijst op, maar met 'false'-resultaten
        // vervangen door een generieke foutmelding die aan gebruiker getoond kan worden.
        .map(([name, message]) => {
            const messageHtml = `<b>${name}:</b> ` + message;
            return messageHtml;
        })
        // bovenstaande map() levert lijst DOM-elementen (<li>'s) op die de foutmeldingen in
        // beeld kunnen brengen
        .map(messageHtml => {
            const listItem = document.createElement("li");
            listItem.innerHTML = messageHtml;
            return listItem;
        })
        .forEach(item => {
            errorList.appendChild(item);
        });
    // bovenstaande forEach() brengt de <li> elementen daadwerkelijk in beeld door ze op
    // de goede plek in de DOM te hangen. Dat is een zij-effect, vandaar forEach() i.p.v. map()
}

// STAP 7
function message(checker, errorMessage) {
    return function(value) {
        if (checker(value) == false) {
            return errorMessage;
        } else {
            return true;
        }
    };
}
// of, zoals de cool kids doen:
function message(checker, errorMsg) {
    return function(value) {
        return checker(value) || errorMsg;
    };
}

// STAP 8: BONUS
// De optional-combinator hoeft niet veranderd te worden die werkt ook
// met error-messages.
function checkBoth(checker1, checker2) {
    return function (value) {
        const result1 = checker1(value)
        const result2 = checker2(value)
        if(typeof result1 == "string" && typeof result2 =="string") {
            // dirty trick! but returning a pair (array) would make code in
            // checkBoth() and validator() much more complex.
            return result1 + "\n" + result2
        } else if (typeof result1 == "string") {
            // result2 = true or false
            return result1;
        } else if (typeof result2 == "string") {
            // result2 = true or false
            return result2;
        } else {
            // both are true or false
            return result1 && result2
        }
    };
}
// De dirty-trick heeft te maken met het feit dat we nu meerdere error-messages
// kunnen terugkrijgen van een checker. We gooien ze even allemaal in 1 string,
// maar later moeten we daar losse messages van maken. Dat zou kunnen met de
// volgende aanpassing in de validator-functie:
/*
const splitCheckResults = namedCheckResults.reduce( (list,[name,result]) => {
  if( typeof result !== "string" ) {
    return [...list,[name,result]]
  } else {
    const allMessages = result.split('/n').map(msg=>[name,msg]);
    return [...list,...allMessages]
  }
}, [])
const checkFailures = namedCheckResults.filter(
*/

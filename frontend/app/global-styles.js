import { injectGlobal } from 'styled-components';

injectGlobal`
  .hidden {
    display: none;
  }

  .lf-u-padding-sm {
    padding: 8px;
  }
  
  .lf-u-padding-md {
    padding: 16px;
  }
  
  .lf-u-padding-lg {
    padding: 24px;
  }
  
  .lf-u-padding-xl {
    padding: 32px;
  }

  .lf-u-color-secondary {
    color: #7D8589;
  }

  .lf-c-card--boxShadow {
    box-shadow: 0px 2px 16px 0 rgba(0, 0, 0, 0.12);
  }

  @media screen and (min-width: 575px) {
    .lf-c-card {
      border-width: 1px;
      border-style: solid;
      border-color: rgba(204, 210, 215, 50);
      border-radius: 4px;
      padding: 32px 24px;
    }
  }
  
  @media screen and (min-width: 767px) {
    .lf-c-card {
      border-width: 1px;
      border-style: solid;
      border-color: rgba(204, 210, 215, 50);
      border-radius: 4px;
      padding: 24px 24px;
    }
  }

  @media screen and (min-width: 991px) {
    .lf-c-card {
      border-width: 1px;
      border-style: solid;
      border-color: rgba(204, 210, 215, 50);
      border-radius: 4px;
      padding: 24px 16px;
    }
  }

  .remove-form-item-colon label:after, .remove-form-item-asterisk label:before {
    content: ""
  }

  /* Text and number input */
.ant-input {
  border: 1px;
  border-color: rgba(204, 210, 215, 100);
  border-style: solid;
  border-radius: 4px;
  /*
  padding: 10px 14px;
  
  letter-spacing: -0.1px;
  line-height: 29px;
  font-size: 16px; */
}
.ant-input-number input {
  border: 1px;
  border-color: rgba(204, 210, 215, 100);
  border-style: solid;
  border-radius: 4px;
  /*
  padding: 10px 14px;
  
  letter-spacing: -0.1px;
  line-height: 29px;
   font-size: 16px; */
}

/* Text and number input with focus */
.ant-input:focus, .ant-input-number input:focus {
  caret-color: rgba(83, 130, 228, 100);
  border-color: rgba(83, 130, 228, 100);
  box-shadow: none;
}

/* Number input */
.ant-input-number input {
  border-style: none;
}

/* Number input with focus */
.ant-input-number input:focus, .ant-input-number :focus {
  border-style: none;
}

/* Number input with focus */
.ant-input-number {
  box-shadow: none;
}

/* Errors for input and number input */
.has-error .ant-input, .has-error .ant-input:hover, .has-error .ant-input:focus, .has-error .ant-input:not([disabled]):hover,
.has-error .ant-input-number, .has-error .ant-input-number:hover, .has-error .ant-input-number:focus, .has-error .ant-input-number:not([disabled]):hover
{
  border: 1px;
  border-color: rgba(222, 140, 62, 100);
  border-radius: 4px;
  border-style: solid;
  box-shadow: none;
}

/* Calendar icon in date picker */
.has-error .ant-calendar-picker-icon:after, .has-error .ant-cascader-picker-arrow, .has-error .ant-picker-icon:after, .has-error .ant-select-arrow, .has-error .ant-time-picker-icon:after {
  color: rgba(222, 140, 62, 100);
}

/* Select menu */
.ant-select-focused .ant-select-selection, .ant-select-selection:active, .ant-select-selection:focus {
  border-color: rgba(204, 210, 215, 100);
  box-shadow: none;
}

/* Select menu error */
.has-error .ant-select-selection {
  border-color: rgba(222, 140, 62, 100);
}

/* Select menu - dropdown icon */
.ant-select .ant-select-arrow:before {
  font-size: 16px;
}

/* Label */
.ant-form-item-label label {
  color: #2E3E48;
}

/* Label with error */
.ant-form-item-label.has-error label {
  color: rgba(222, 140, 62, 100);
}

/* Error message */
.has-error .ant-form-explain {
  color: rgba(222, 140, 62, 100);
}

/* Error icon */
.has-error.has-feedback:after {
  /* content: ""; */
  color: rgba(222, 140, 62, 100);
}
.has-success.has-feedback:after {
  /* content: ""; */
}

.ant-input-disabled {
  border: 0px;
  border-style: none;
  border-radius: 4px;
  border-color: rgba(204, 210, 215, 20);
  color: #DDE3E8;
}

.ant-select-disabled .ant-select-selection {
  border: 0px;
  border-style: none;
  border-radius: 4px;
  border-color: rgba(204, 210, 215, 20);
  color: #DDE3E8;
}

.ant-select-selection__rendered {
  margin-left: 14px;
}

/* Required asterisk */
.ant-form-item-required:before {
  color: #2E3E48;
}

.form-item-disabled label, .form-item-disabled  .ant-form-item-required:before {
  color: #DDE3E8;
}
/* Form item layout */
.ant-row .ant-form-item {
  /* margin-bottom: 0; */
}

/* Form item label layout */
/*
.ant-form-item-label {
  display: block;
  text-align: left;
  width: 100%;
}*/

/* Form item label without colon */
.ant-form-item-label label:after {
  content: ""
}

/* Form item label without asterisk */
.ant-form-item-label label:before {
  content: ""
}

`;

/* eslint no-unused-expressions: 0 */
/* injectGlobal`
  html,
  body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  body.fontLoaded {
    font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  #app {
    background-color: #fafafa;
    min-height: 100%;
    min-width: 100%;
  }

  p,
  label {
    font-family: Georgia, Times, 'Times New Roman', serif;
    line-height: 1.5em;
  }
`; */

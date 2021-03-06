import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import RenderField from './RenderField';
import { getFieldValue, buildValidateJsObject as _buildValidateJsObject } from './helpers';

export const buildValidateJsObject = _buildValidateJsObject

const USE_ON_CHANGE_AND_BLUR = true;

class DocForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      changedFields: {},
      focusFields: {},
      blurFields: {},
      unValidFields: [],
    };
    this.renderFields = this.renderFields.bind(this);
    this.renderField = this.renderField.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.focusNext = this.focusNext.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeAndBlur = this.onChangeAndBlur.bind(this);
    this.enableValidateField = this.enableValidateField.bind(this);
    this.onValidateStateChanged = this.onValidateStateChanged.bind(this);
    this.getAllPerviousFields = this.getAllPerviousFields.bind(this);
    this.onRef = this.onRef.bind(this);
    this.getOtherFieldRefByKey = this.getOtherFieldRefByKey.bind(this);
    this.onRefRenderField = this.onRefRenderField.bind(this);
    this.handleChangedFieldsTracking = this.handleChangedFieldsTracking.bind(this);
    this.handleFocusFieldTracking = this.handleFocusFieldTracking.bind(this);
    this.handleBlurFieldTracking = this.handleBlurFieldTracking.bind(this);
    this.fieldsInitialValue = {};
    this.inputsRef = {};
    this.renderFieldsRef = {};
    this.inputPositionByKey = {}
  }
  // --- Tracking on all fields event, help us know when to show to user fields errors
  handleChangedFieldsTracking(key) {
    this.handleTrackingByKeyAndType(key, 'changedFields')
  }

  handleFocusFieldTracking(key) {
    this.handleTrackingByKeyAndType(key, 'focusFields')
  }

  handleBlurFieldTracking(key) {
    this.handleTrackingByKeyAndType(key, 'blurFields')
  }

  handleTrackingByKeyAndType(key, type) {
    const { showSkippingFieldsWarnings } = this.props;
    let updateTracking = { ...this.state[type] };
    if (!updateTracking[key]) {
      updateTracking[key] = true;
      if (showSkippingFieldsWarnings) {
        updateTracking = { ...updateTracking, ...this.getAllPerviousFields(key) };
      }
      this.setState({ [type]: updateTracking });
    }
  }

  onFocus(res) {
    const {
      key, value, isValid, info
    } = res;
    this.handleFocusFieldTracking(key)
    this.fieldsInitialValue[key] = value; // update the initial value
    if (this.props.onFocus) {
      this.props.onFocus({
        key, value, isValid, initialValue: value, info
      });
    }
  }

  onChangeAndBlur(res) {
    this.handleTrackingByKeyAndType(res.key, 'changedFields')
    this.handleTrackingByKeyAndType(res.key, 'blurFields')
    this.onChange(res, USE_ON_CHANGE_AND_BLUR)
    // USE_ON_CHANGE_AND_BLUR is a way to run onChange and share
    // onChange method but run onChangeAndBlur at the end
  }

  onChange(res, useOnChangeAndBlur) {
    const { key, value, isValid, info } = res;
    this.handleChangedFieldsTracking(key);
    const initialValue = this.fieldsInitialValue[key];
    const updateData = { ...this.props.data, [key]: value };
    const payload = {
      key, value, isValid, initialValue, updateData, info
    }
    if(useOnChangeAndBlur) {
      this.props.onChangeAndBlur(payload)
    }else{
      this.props.onChange(payload);
    }
  }

  onBlur(res) {
    const {
      key, value, isValid, info
    } = res;
    this.handleBlurFieldTracking(key)
    const initialValue = this.fieldsInitialValue[key];
    if (this.props.onBlur) {
      this.props.onBlur({
        key, value, isValid, initialValue, info
      });
    }
  }

  onValidateStateChanged(fieldKey, isValid) { // This will call from './RenderField'
    let unValidFields = [...this.state.unValidFields];
    const { onValidateStateChanged } = this.props;
    if (isValid) { // Remove valid field
      unValidFields = unValidFields.filter(field => field !== fieldKey);
      this.setState({ unValidFields }, () => {
        if (onValidateStateChanged) {
          onValidateStateChanged({ unValidFields, isValid: !unValidFields.length });
        }
      });
    } else { // Add un valid field
      unValidFields.push(fieldKey);
      this.setState({ unValidFields }, () => {
        if (onValidateStateChanged) {
          onValidateStateChanged({ unValidFields, isValid: false });
        }
      });
    }
  }

  onRef(ref, position, inputKey) { // We want to save all fields ref to let the focusNext option
    this.inputPositionByKey[inputKey] = position
    this.inputsRef[position] = ref;
  }

  getOtherFieldRefByKey(inputKey) { // Sometimes one field need to manipulate another field, with this he can
    const fieldPosition = this.inputPositionByKey[inputKey]
    return {
      input: this.inputsRef[fieldPosition],
      parent: this.renderFieldsRef[inputKey]
    }
  }

  onRefRenderField(ref) { // We want to pass on getOtherFieldRefByKey input ref and wrapper(RenderField) ref;
    if(ref && ref.props) {
      this.renderFieldsRef[ref.props.id] = ref
    }
  }

  getAllPerviousFields(key) {
    const { fields } = this.props;
    const perviousFields = {};
    let stopProcess = false;
    let keyToCheck = 0;
    while (!stopProcess) {
      if (fields[keyToCheck].key === key) {
        stopProcess = true;
      } else {
        perviousFields[fields[keyToCheck].key] = true;
      }
      keyToCheck += 1;
    }
    return perviousFields;
  }

  focusNext(key, position) {
    const {
      enableOpenPickerOnFocusNext, focusNextOnlyIfEmpty, data, fields
    } = this.props;
    const nextField = position + 1;
    const currentField = position
    if (this.inputsRef[nextField] &&
          (this.inputsRef[nextField].focus || this.inputsRef[nextField].openPicker)
    ) {
      let enabledNext = true;
      if (focusNextOnlyIfEmpty) {
        const nextFieldValue = getFieldValue(fields[nextField], data, this.props);
        enabledNext = isEmpty(nextFieldValue);
      }
      if (enabledNext && this.inputsRef[nextField].focus) {
        this.inputsRef[nextField].focus();
      } else if (enabledNext && enableOpenPickerOnFocusNext) {
        this.inputsRef[nextField].openPicker();
      }
    } else{
      if (this.props.fields.length >= (nextField + 1)) {
        console.warn('react-cross-form - you enabled focusNext but ref/ref.focus() didn\'t found, check the onRef on the next field', { fieldKey: key });
      }
      if(this.inputsRef[currentField]) {
        this.inputsRef[currentField].blur()
      }
    }
  }

  enableValidateField(field) {
    const { validateType } = this.props;
    const { focusFields, blurFields, changedFields } = this.state;
    let showWarnings = false;
    if (validateType === 'none') {
      showWarnings = false;
    } else if (validateType === 'all') {
      showWarnings = true;
    } else if (validateType === 'onFocus') {
      showWarnings = focusFields[field.key];
    } else if (validateType === 'onBlur') {
      showWarnings = blurFields[field.key];
    } else if (validateType === 'onChange') {
      showWarnings = changedFields[field.key];
    }
    return showWarnings;
  }

  renderField(field, index, isGroup) {
    const { data, requiredPrefix, disabledAll, fieldsOptions, dispatchId, isLoading, ...resProps } = this.props;
    const propsToPass = {
      id: field.key,
      onRefRenderField: this.onRefRenderField,
      onRef: this.onRef,
      position: index,
      key: field.key,
      field: field,
      data: data,
      onChange: this.onChange,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onChangeAndBlur: this.onChangeAndBlur,
      onValidateStateChanged: this.onValidateStateChanged,
      showWarnings: this.enableValidateField(field),
      requiredPrefix: requiredPrefix,
      disabledAll: disabledAll,
      focusNext: this.focusNext,
      options: fieldsOptions[field.key],
      getOtherFieldRefByKey: this.getOtherFieldRefByKey,
      dispatchId: dispatchId,
      isLoading: isLoading,
      resProps
    }
    if(isGroup) {
      return (propsFromGroup = {}) => <RenderField {...propsToPass} propsFromGroup={propsFromGroup} />
    }
    return (
      <RenderField {...propsToPass} />
    );
  }

  renderFields() {
    const { fields, render } = this.props;
    let position = 0
    let _fields
    if(render) {
      _fields = {}
      fields.forEach((field) => {
        _fields[field.key] = this.renderField(field, position++)
      })
    }else{
      _fields = []
      fields.forEach((field) => {
        if(field.group) {
          const fieldGroup = {}
          field.group.forEach(childField => {
            fieldGroup[childField.key] = this.renderField(childField, position++, true)
          })
          const groupElement = React.createElement(field.component, {inputsGroup: fieldGroup, ...field})
          _fields.push(groupElement)
        }else{
          _fields.push(this.renderField(field, position++))
        }
      });
    }
    return _fields
  }

  render() {
    const { render } = this.props;
    if(render) {
      return render(this.renderFields())
    }else{
      return this.renderFields();
    }
  }
}

DocForm.propTypes = {
  data: PropTypes.object, // {firstName: 'David', age: 35}
  fields: PropTypes.PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired, // firstName
    label: PropTypes.string, // i18n('firstName')
    component: PropTypes.any.isRequired, // TextInput
    required: PropTypes.bool, // true
    disabled: PropTypes.bool, // false
    formatter: PropTypes.func, // () => {field , documentData} // We using this inside the helpers.js
    validators: PropTypes.object, // { presence: true, email: true } // https://validatejs.org/#validators,
    customValidation: PropTypes.function, // { field, value, data } need to return array of string
    placeholder: PropTypes.string
  })),
  validateType: PropTypes.oneOf(['none', 'all', 'onFocus', 'onBlur', 'onChange']),
  onChange: PropTypes.func.isRequired, // {key, value,isValid, initialValue, updateData, info},
  onChangeAndBlur: PropTypes.func, // {key, value,isValid, initialValue, updateData, info}
  onFocus: PropTypes.func, // () => {key, value, isValid, initialValue, info}
  onBlur: PropTypes.func, // () => {key, value, isValid, initialValue, info}
  onValidateStateChanged: PropTypes.func, // () => {unValidFields, isValid}
  requiredPrefix: PropTypes.string, // *
  disabledAll: PropTypes.bool,
  enableOpenPickerOnFocusNext: PropTypes.bool,
  focusNextOnlyIfEmpty: PropTypes.bool,
  showSkippingFieldsWarnings: PropTypes.bool,
  fieldsOptions: PropTypes.object // you can pass your inputs an object with options, key for each data is field.key
};

DocForm.defaultProps = {
  data: {},
  fieldsOptions: {},
  fields: [],
  validateType: 'all',
  requiredPrefix: '*',
  disabledAll: false,
  onChange: () => console.warn('react-cross-form - missing onChange'),
  onChangeAndBlur: () => console.log('react-cross-form -missing onChangeAndBlur')
};

export default DocForm;

/* eslint func-names: 'off' */
/* eslint linebreak-style: 'off' */
/* eslint no-underscore-dangle: 'off' */
/* eslint react/require-default-props: 'off' */
/* eslint react/require-default-props: 'off' */
/* eslint react/default-props-match-prop-types: 'off' */
/* eslint react/forbid-prop-types: 'off' */
/* eslint react/jsx-filename-extension: 'off' */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _validate = require('validate.js');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RenderField = function (_React$PureComponent) {
  _inherits(RenderField, _React$PureComponent);

  function RenderField(props) {
    _classCallCheck(this, RenderField);

    var _this = _possibleConstructorReturn(this, (RenderField.__proto__ || Object.getPrototypeOf(RenderField)).call(this, props));

    _this.state = {
      validatorMessage: null
    };
    _this.renderFieldByType = _this.renderFieldByType.bind(_this);
    _this.validateField = _this.validateField.bind(_this);
    _this.onFocus = _this.onFocus.bind(_this);
    _this.onBlur = _this.onBlur.bind(_this);
    _this.onChange = _this.onChange.bind(_this);
    _this.onChangeAndBlur = _this.onChangeAndBlur.bind(_this);
    _this.onRef = _this.onRef.bind(_this);
    _this.isFieldValid = _this.isFieldValid.bind(_this);
    _this.focusNext = _this.focusNext.bind(_this);
    _this.lastIsFieldValid = true;
    _this.lastValidatorMessage = null;
    return _this;
  }

  _createClass(RenderField, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _props = this.props,
          field = _props.field,
          data = _props.data;

      var value = (0, _helpers.getFieldValue)(field, data, this.props);
      this.validateField(field, value, data);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      var _props2 = this.props,
          field = _props2.field,
          data = _props2.data;

      var lastValue = (0, _helpers.getFieldValue)(field, prevProps.data, prevProps);
      var newValue = (0, _helpers.getFieldValue)(field, this.props.data, this.props);
      if (!(0, _isEqual2.default)(lastValue, newValue) || // Input value was changed
      !(0, _isEqual2.default)(field, prevProps.field) // Input config was changed
      ) {
          this.validateField(field, newValue, data);
        }
    }
  }, {
    key: 'onRef',
    value: function onRef(ref) {
      var _props3 = this.props,
          onRef = _props3.onRef,
          field = _props3.field,
          position = _props3.position;
      var key = field.key;

      if (field.onRef) {
        // onRef from field config
        field.onRef(ref, position);
      }
      onRef(ref, position, key); //onRef from './index
    }
  }, {
    key: 'onFocus',
    value: function onFocus(info) {
      var _props4 = this.props,
          field = _props4.field,
          data = _props4.data;
      var key = field.key;

      var value = (0, _helpers.getFieldValue)(field, data, this.props);
      var isValid = (0, _validate.isEmpty)(this.state.validatorMessage);
      this.props.onFocus({
        key: key, value: value, isValid: isValid, info: info
      });
    }
  }, {
    key: 'onChange',
    value: function onChange(value, info) {
      var field = this.props.field;
      var key = field.key;

      var isValid = (0, _validate.isEmpty)(this.state.validatorMessage);
      var parameters = {
        key: key, value: value, isValid: isValid, info: info
      };
      this.props.onChange(parameters);
    }
  }, {
    key: 'onChangeAndBlur',
    value: function onChangeAndBlur(value, info) {
      var _this2 = this;

      var _props5 = this.props,
          field = _props5.field,
          position = _props5.position;
      var key = field.key;
      // We want to validate field before we run this because is not a regular onChange and onBlur flow

      this.validateField(field, value, this.props.data, function (validatorMessage) {
        var isValid = !value || (0, _validate.isEmpty)(validatorMessage); // We add !value because we want to let the user the ability to clean field even if it is a required field
        var parameters = { key: key, value: value, isValid: isValid, info: info };
        _this2.props.onChangeAndBlur(parameters, position);
        if (field.onChanged) {
          field.onChanged(parameters, _this2.props);
        }
      });
    }
  }, {
    key: 'onBlur',
    value: function onBlur(info) {
      var _props6 = this.props,
          field = _props6.field,
          data = _props6.data,
          position = _props6.position;
      var key = field.key;

      var value = (0, _helpers.getFieldValue)(field, data, this.props);
      var isValid = (0, _validate.isEmpty)(this.state.validatorMessage);
      var parameters = { key: key, value: value, isValid: isValid, info: info };
      this.props.onBlur(parameters, position);
      if (field.onChanged) {
        field.onChanged(parameters, this.props);
      }
    }
  }, {
    key: 'focusNext',
    value: function focusNext() {
      var _props7 = this.props,
          field = _props7.field,
          position = _props7.position;
      var key = field.key;

      this.props.focusNext(key, position);
    }
  }, {
    key: 'isFieldValid',
    value: function isFieldValid() {
      return (0, _validate.isEmpty)(this.state.validatorMessage);
    }
  }, {
    key: 'validateField',
    value: function validateField(field, value, data, callBack) {
      var validatorMessage = field.customValidation ? field.customValidation(field, value, data, this.props) : (0, _helpers.getFieldValidatorMessage)(field, value);
      var isValid = (0, _validate.isEmpty)(validatorMessage);
      if (!(0, _isEqual2.default)(isValid, this.lastIsFieldValid) || !(0, _isEqual2.default)(validatorMessage, this.lastValidatorMessage)) {
        this.lastIsFieldValid = isValid;
        this.lastValidatorMessage = validatorMessage;
        this.props.onValidateStateChanged(field.key, isValid);
        this.setState({ validatorMessage: validatorMessage }, function () {
          if (callBack) {
            callBack(validatorMessage);
          }
        });
      } else {
        if (callBack) {
          callBack(validatorMessage);
        }
      }
    }
  }, {
    key: 'renderFieldByType',
    value: function renderFieldByType() {
      var _props8 = this.props,
          field = _props8.field,
          data = _props8.data,
          showWarnings = _props8.showWarnings,
          requiredPrefix = _props8.requiredPrefix,
          disabledAll = _props8.disabledAll,
          getOtherFieldRefByKey = _props8.getOtherFieldRefByKey,
          onRefRenderField = _props8.onRefRenderField,
          propsFromGroup = _props8.propsFromGroup,
          isLoading = _props8.isLoading,
          dispatchId = _props8.dispatchId;

      var validators = field.validators,
          key = field.key,
          component = field.component,
          options = field.options,
          label = field.label,
          placeholder = field.placeholder,
          helpText = field.helpText,
          render = field.render,
          resField = _objectWithoutProperties(field, ['validators', 'key', 'component', 'options', 'label', 'placeholder', 'helpText', 'render']);

      var InputElement = component;
      var value = (0, _helpers.getFieldValue)(field, data, this.props);
      var isValid = this.isFieldValid();
      var isRequired = validators && validators.presence;
      if (this.props.options && field.options) {
        console.warn('react-cross-form - it seem the parent pass an options and you pass options with field configuration, you can find field.options as fieldOptions');
      }
      var _required = isRequired && requiredPrefix ? requiredPrefix : '';
      var propsToPass = _extends({
        ref: onRefRenderField,
        key: key,
        id: key,
        // input attributes
        value: value,
        disabled: field.disabled || disabledAll,
        label: label,
        requiredPrefix: requiredPrefix,
        labelWithPrefix: '' + _required + label,
        placeholder: placeholder,
        // events
        onFocus: this.onFocus,
        onBlur: this.onBlur,
        onChange: this.onChange,
        onChangeAndBlur: this.onChangeAndBlur,
        // callback that help to focus nextField
        onRef: this.onRef,
        focusNext: this.focusNext,
        getOtherFieldRefByKey: getOtherFieldRefByKey,
        // validators
        showWarnings: showWarnings,
        isValid: isValid,
        validatorMessage: this.state.validatorMessage,
        required: isRequired,
        validateStatus: showWarnings ? isValid ? 'success' : 'error' : null,
        // options for dropdowns
        options: this.props.options || options,
        fieldOptions: this.props.options ? options : null,
        // The rest of the field configuration
        helpText: helpText,
        dispatchId: dispatchId,
        isLoading: isLoading
      }, resField, propsFromGroup, {
        documentData: data
      });
      if (render) {
        return render(propsToPass);
      }
      return _react2.default.createElement(InputElement, propsToPass);
    }
  }, {
    key: 'render',
    value: function render() {
      return this.renderFieldByType();
    }
  }]);

  return RenderField;
}(_react2.default.PureComponent);

exports.default = RenderField;


RenderField.propTypes = process.env.NODE_ENV !== "production" ? {
  onRef: _propTypes2.default.func,
  position: _propTypes2.default.number.isRequired,
  onValidateStateChanged: _propTypes2.default.func,
  field: _propTypes2.default.object,
  data: _propTypes2.default.any,
  onChange: _propTypes2.default.func,
  onFocus: _propTypes2.default.func,
  onBlur: _propTypes2.default.func,
  focusNext: _propTypes2.default.func,
  showWarnings: _propTypes2.default.bool,
  requiredPrefix: _propTypes2.default.string,
  disabledAll: _propTypes2.default.bool
} : {};
RenderField.defaultProps = {
  data: {},
  propsFromGroup: {}
};

/* eslint func-names: 'off' */
/* eslint linebreak-style: 'off' */
/* eslint no-underscore-dangle: 'off' */
/* eslint react/require-default-props: 'off' */
/* eslint react/require-default-props: 'off' */
/* eslint react/default-props-match-prop-types: 'off' */
/* eslint react/forbid-prop-types: 'off' */
/* eslint react/jsx-filename-extension: 'off' */

module.exports = exports['default'];
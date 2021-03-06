import Intact from 'intact';
import template from './calendar.vdt';
import {strPad, range} from '../utils';
import {getNowDate} from './utils';

export default class Calendar extends Intact {
    @Intact.template()
    static template = template;

    static propTypes = {
        multiple: Boolean, 
        disabledHours: Boolean,
        disabledMinutes: Boolean,
        disabledSeconds: Boolean,
    };

    defaults() {
        return {
            value: undefined,
            maxDate: undefined,
            minDate: undefined,
            disabledDate(date) { return false; },
            multiple: false,
            type: 'date',
            hours: range(0, 23),
            minutes: range(0, 59),
            seconds: range(0, 59),
            disabledHours: false,
            disabledMinutes: false,
            disabledSeconds: false,
            dayClassNames: undefined,
            onMouseEnterDay: undefined,
            onMouseLeaveDays: undefined,

            _showDate: undefined,
            _now: getNowDate(),
            _isShowYearPicker: false,
            _isSelectTime: false,
        }
    }

    _init() {
        const {value, multiple} = this.get();
        this._index = multiple && value && value.length - 1 || 0;
    }

    select(v, e) {
        const value = this.getDateString(v);
        const type = this.get('type');
        if (!this.get('multiple')) {
            this.set('value', value, {async: true});
            if (type !== 'datetime') {
                this.trigger('hide');
            } else {
                // when we set _isSelectTime to true, the dom has
                // been replaced with time selecter, so we set the
                // _dropdown to true to tell TooltipContent that
                // we click on drodown and don't hide it
                e._rawEvent._dropdown = true;
                this.set('_isSelectTime', true, {async: true});
            }
        } else {
            let values = this.get('value');
            if (!Array.isArray(values)) {
                values = [];
            } else {
                values = values.slice(0);
            }
            if (type !== 'datetime') {
                const index = values.indexOf(value);
                if (~index) {
                    values.splice(index, 1);
                } else {
                    values.push(value);
                }
            } else {
                values.push(value);
                e._rawEvent._dropdown = true;
                this.set('_isSelectTime', true, {async: true});
            }
            this._index = values.length - 1;
            this.set('value', values, {async: true});
        }

        this.set('_showDate', v, {async: true});
    }

    getDateString(date) {
        const _date = [
            date.getFullYear(),
            strPad(date.getMonth() + 1, 2),
            strPad(date.getDate(), 2)
        ].join('-');
        if (this.get('type') !== 'datetime') {
            return _date;
        }
        const _time = [
            strPad(date.getHours(), 2),
            strPad(date.getMinutes(), 2),
            strPad(date.getSeconds(), 2)
        ].join(':');
        return `${_date} ${_time}`;
    }

    prevMonth() {
        this.setRelativeMonth(-1);
    }

    nextMonth() {
        this.setRelativeMonth(1);
    }

    prevYear() {
        this.setRelativeYear(-1);
    }

    nextYear() {
        this.setRelativeYear(1);
    }

    setRelativeMonth(month) {
        const date = this.getShowDate();
        date.setMonth(date.getMonth() + month);
        this.set('_showDate', date);
    }

    setRelativeYear(year) {
        const date = this.getShowDate();
        date.setFullYear(date.getFullYear() + year);
        this.set('_showDate', date);
    }

    setMonth(month) {
        const date = this.getShowDate();
        date.setMonth(month);
        this.set('_showDate', date);
    }

    setYear(year) {
        const date = this.getShowDate();
        date.setFullYear(year);
        this.set('_showDate', date);
    }

    onChangeYear(c, value) {
        this.setYear(value);
    }

    onChangeMonth(c, value) {
        this.setMonth(value);
    }

    getShowDate() {
        const {_showDate, value, _now, multiple} = this.get();
        const values = multiple ? value || [] : [value];
        return new Date(_showDate || values[this._index] || _now);
    }

    setShowDate(date) {
        this.set('_showDate', date);
    }

    showYearPicker() {
        this.set('_isShowYearPicker', !this.get('_isShowYearPicker'));
    }

    onChangeTime(type, c, v) {
        this.isSelectTime = true;

        const {value, _now, multiple} = this.get();

        let valueDate = new Date(
            (multiple ? 
                (value && value[this._index]) :
                value
            ) || _now
        );
        valueDate['set' + type](v);
        valueDate = this.getDateString(valueDate);

        if (!multiple) {
            this.set('value', valueDate);
        } else {
            let _value;
            if (value) {
                _value = value.slice(0);
                _value[this._index] = valueDate;
            } else {
                _value = [valueDate];
            }

            this.set('value', _value);
        }

        this.isSelectTime = false;
    }

    confirm() {
        this.refs.calendar.hide();
    }

    cancel(e) {
        e._rawEvent._dropdown = true;
        this.set('_isSelectTime', false);
    }
}


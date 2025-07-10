import {type PropType, defineComponent, inject, ref, renderSlot, watchEffect, toRef, computed, toRefs} from "vue";
import {
    Switch,
    Checkbox,
    CheckboxGroup,
    Radio,
    RadioGroup,
    Stepper,
    Rate,
    Slider,
    Field,
    Popup,
    Picker,
    Area,
    DatePicker,
    TimePicker,
    Cascader,
    PickerGroup,
    type PickerConfirmEventParams,
    type DatePickerProps,
    type TimePickerProps
} from 'vant'
import {has, isArray, isBoolean, isFunction,} from "lodash-es";
import {getPlaceholder, getRules, getRightIcon} from './utils'
import {areaList, useCascaderAreaData} from '@vant/area-data'
import {RightIconCompMap, CompsEventsMap} from "./constatnts";
import {XDatetimePicker} from '../datetime-picker'
import type {CompAttrsPropsMap, CompTypes, FormProvideProps, PickerOption, XFormItemRow} from "./types";

export default defineComponent({
    props: {
        formValue: {
            type: Object as any
        },
        type: {
            type: String as PropType<CompTypes>,
            required: true,
        },
        label: {
            type: String,
            default: ''
        },
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Array as PropType<PickerOption<CompTypes>[]>,
            default: () => []
        },
        required: {
            type: Boolean,
            default: false
        },
        readonly: {
            type: Boolean,
            default: false
        },
        itemAttrs: {
            type: Object as PropType<any>,
            default: () => ({})
        },
        popup: {
            type: Object as PropType<XFormItemRow['popup']>,
            default: () => ({})
        },
        orgAttrs: {
            type: Object as PropType<CompAttrsPropsMap[CompTypes]>,
            default: () => ({})
        },
        config: {
            type: Object as PropType<any>,
            default: () => ({})
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    setup(props, {}) {
        const {
            type,
            label,
            name,
            required,
            readonly,
            options,
            itemAttrs,
            orgAttrs,
            popup,
            config,
            formValue,
            disabled
        } = toRefs(props)
        const {formSlots, rules, onEvents} = inject('x-form') as FormProvideProps
        const showPopup = ref(false)
        /* 事件收集器 */
        const eventsCollector = () => {
            let events: any = {}
            if (CompsEventsMap['change'].includes(type.value)) {
                events['onChange'] = (...args: any) => onEvents('change', name.value, ...args)
            }

            if (CompsEventsMap['blur'].includes(type.value)) {
                events['onBlur'] = (e: MouseEvent) => onEvents('blur', name.value, e);
            }

            if (CompsEventsMap['focus'].includes(type.value)) {
                events['onFocus'] = (e: MouseEvent) => onEvents('focus', name.value, e);
            }

            if (CompsEventsMap['click'].includes(type.value)) {
                events['onClick'] = (e: MouseEvent) => onEvents('click', name.value, e)
            }
            return events
        }
        /* 处理slot */
        const handlerSlot = () => {
            let slots: any = {}

            const isHas = (slotName: string) => itemAttrs.value && has(itemAttrs.value, 'slots') && has(itemAttrs.value.slots, slotName)
            const renderSlotName = (slotName: string, query?: any) => {
                if (isFunction(itemAttrs.value.slots[slotName])) {
                    return itemAttrs.value.slots[slotName](query)
                } else {
                    throw new Error(`slots.${slotName} is not a function`)
                    return null
                }
            }

            if (label.value || has(formSlots, `${name.value}.label`) || isHas('label')) {
                slots['label'] = () => has(formSlots, `${name.value}.label`) ? renderSlot(formSlots, `${name.value}.label`) : isHas('label') ? renderSlotName('label') : label.value
            }

            if (has(formSlots, `${name.value}.left-icon`) || isHas('left-icon')) {
                slots['left-icon'] = () => has(formSlots, `${name.value}.left-icon`) ? renderSlot(formSlots, `${name.value}.left-icon`) : renderSlotName('left-icon')
            }

            if (has(formSlots, `${name.value}.right-icon`) || isHas('right-icon')) {
                slots['right-icon'] = () => has(formSlots, `${name.value}.right-icon`) ? renderSlot(formSlots, `${name.value}.right-icon`) : renderSlotName('right-icon')
            }

            if (has(formSlots, `${name.value}.error-message`) || isHas('error-message')) {
                slots['error-message'] = ({message}: {
                    message: string
                }) => has(formSlots, `${name.value}.error-message`) ? renderSlot(formSlots, `${name.value}.error-message`, {message}) : renderSlotName('error-message', {message})
            }

            if (has(formSlots, `${name.value}.button`) || isHas('button')) {
                slots['button'] = () => has(formSlots, `${name.value}.button`) ? renderSlot(formSlots, `${name.value}.button`) : renderSlotName('button')
            }

            if (has(formSlots, `${name.value}.extra`) || isHas('extra')) {
                slots['extra'] = () => has(formSlots, `${name.value}.extra`) ? renderSlot(formSlots, `${name.value}.extra`) : renderSlotName('extra')
            }

            return slots
        }

        const handlerCompSlots = () => {
            if (has(orgAttrs.value, 'slots')) {
                return orgAttrs.value.slots
            }
            return {}
        }
        /* 通用基本配置 */
        const getBasicConfig = (row: Indexable = {}) => {
            const curRules = has(itemAttrs.value, 'rules') && isArray(itemAttrs.value.rules) ? itemAttrs.value.rules : [] // 组件内部rules
            const itemRules = has(config.value.value, 'rules') ? config.value.value.rules : []; //局部rules
            const formRules = has(rules, name.value) ? rules[name.value] : [] //全局rules
            const newRules = [...curRules, ...itemRules, ...formRules]

            const FieldAttrs: any = {
                placeholder: getPlaceholder(type.value, label.value, itemAttrs.value?.placeholder),
                required: required.value,
                rules: getRules(required.value, newRules, label.value),
                label: label.value,
                name: name.value,
                disabled: props.disabled,
            };

            if (has(config.value.value, 'hiddenLabel') && isBoolean(config.value.value.hiddenLabel) && config.value.value.hiddenLabel) {
                FieldAttrs['class'] = 'xform-hidden-label';
            }

            Object.assign(FieldAttrs, itemAttrs.value);

            const isDisabled = FieldAttrs.disabled

            if (RightIconCompMap.includes(type.value)) {
                // console.log(itemAttrs.value);
                
                Object.assign(FieldAttrs, {
                    'right-icon': !isDisabled && getRightIcon(type.value),
                    readonly: true,
                    onClickRightIcon: () => {
                        if(FieldAttrs.disabled) return
                        showPopup.value = true;
                    },
                    onClick: () => {
                        if(FieldAttrs.disabled) return
                        showPopup.value = true;
                    }
                })
            }
            return Object.assign(FieldAttrs, row)
        }
        const onCancel = () => {
            closePopup()
            onEvents('cancel', name.value)
        }
        const closePopup = () => showPopup.value = false;

        const compGenerator: { [k in CompTypes]: any } = {
            'input': () => {
                return <Field v-model={formValue.value[name.value]}
                              {...eventsCollector()}
                              {...getBasicConfig()}
                              v-slots={handlerSlot()}/>
            },
            'picker': () => {
                return <>
                    <Field
                        v-model={formValue.value[`${name.value}Text`]}
                        {...getBasicConfig()}
                        v-slots={handlerSlot()}
                    />
                    {renderPopup(
                        <Picker
                            v-model={formValue.value[name.value]}
                            title={`请选择${label.value}`}
                            columns={options.value}
                            {...eventsCollector()}
                            {...orgAttrs.value}
                            onConfirm={(...args: any) => {
                                const [{selectedOptions}] = args
                                formValue.value[`${name.value}Text`] = selectedOptions.map((item: any) => item.text).join('/')
                                closePopup()
                                onEvents('confirm', name.value, ...args)
                            }}
                            onChange={(...args: any) => onEvents('change', name.value, ...args)}
                            onCancel={onCancel}
                            v-slots={handlerCompSlots()}
                        />
                    )}

                </>
            },
            'area': () => {
                return <>
                    <Field v-model={formValue.value[`${name.value}Text`]} {...getBasicConfig()}
                           v-slots={handlerSlot()}/>
                    {renderPopup(
                        <Area
                            v-model={formValue.value[name.value]}
                            title={`请选择${label.value}`}
                            areaList={areaList}
                            {...eventsCollector()}
                            {...orgAttrs.value}
                            onConfirm={(...args: any) => {
                                const [{selectedOptions}] = args
                                formValue.value[`${name.value}Text`] = selectedOptions.map((item: any) => item.text).join('/')
                                closePopup()
                                onEvents('confirm', name.value, ...args)
                            }}
                            onChange={(...args: any) => onEvents('change', name.value, ...args)}
                            onCancel={onCancel}
                            v-slots={handlerCompSlots()}
                        />
                    )}
                </>
            },
            'cascader': () => {
                const areaOptions = useCascaderAreaData()

                return <>
                    <Field v-model={formValue.value[`${name.value}Text`]} {...getBasicConfig()}
                           v-slots={handlerSlot()}/>

                    {renderPopup(
                        <Cascader
                            v-model={formValue.value[name.value]}
                            title={`请选择${label.value}`}
                            options={orgAttrs.value && has(orgAttrs.value, 'useVantAreaData') ? areaOptions : options.value}
                            {...eventsCollector()}
                            {...orgAttrs.value}
                            onFinish={(...args: any) => {
                                const [{selectedOptions}] = args
                                formValue.value[`${name.value}Text`] = selectedOptions.map((item: any) => item.text).join('/')
                                closePopup()
                                onEvents('finish', name.value, ...args)
                            }}
                            onChange={(...args: any) => onEvents('change', name.value, ...args)}
                            onClickTab={(...args: any) => onEvents('click-tab', name.value, ...args)}
                            onClose={onCancel}
                            v-slots={handlerCompSlots()}
                        />
                    )}
                </>
            },
            'date-picker': () => {
                const curYear = new Date().getFullYear();
                return <>
                    <Field v-model={formValue.value[`${name.value}Text`]} {...getBasicConfig()}
                           v-slots={handlerSlot()}/>
                    {/* 日期选择器Popup */}
                    {renderPopup(
                        <DatePicker
                            v-model={formValue.value[name.value]}
                            title={`请选择${label.value}`}
                            {...eventsCollector()}
                            {...(orgAttrs.value as CompAttrsPropsMap['date-picker'])}
                            minDate={has(orgAttrs.value, 'minDate') ? orgAttrs.value['minDate'] : (new Date(curYear - 20, 1, 1))}
                            maxDate={has(orgAttrs.value, 'maxDate') ? orgAttrs.value['maxDate'] : (new Date(curYear + 10, 12, 31))}
                            onConfirm={(...args: any) => {
                                formValue.value[`${name.value}Text`] = formValue.value[name.value].join('-')
                                closePopup()
                                onEvents('confirm', name.value, ...args)
                            }}
                            onChange={(...args: any) => onEvents('change', name.value, ...args)}
                            onCancel={onCancel}
                            v-slots={handlerCompSlots()}
                        />
                    )}
                </>
            },
            'time-picker': () => {
                return <>
                    <Field v-model={formValue.value[`${name.value}Text`]} {...getBasicConfig()}
                           v-slots={handlerSlot()}/>
                    {/* 时间选择器popup */}
                    {renderPopup(
                        <TimePicker
                            v-model={formValue.value[name.value]}
                            title={`请选择${label.value}`}
                            {...eventsCollector()}
                            {...(orgAttrs.value as CompAttrsPropsMap['time-picker'])}
                            onConfirm={(...args: any) => {
                                formValue.value[`${name.value}Text`] = formValue.value[name.value].join(':')
                                closePopup()
                                onEvents('confirm', name.value, ...args)
                            }}
                            onChange={(...args: any) => onEvents('change', name.value, ...args)}
                            onCancel={onCancel}
                            v-slots={handlerCompSlots()}
                        />
                    )}
                </>
            },
            'datetime-picker': () => {
                const curYear = new Date().getFullYear();
                const curAttrs = orgAttrs.value as CompAttrsPropsMap['datetime-picker']
                const defaultDateTime = (rows: CompAttrsPropsMap['datetime-picker']) => {
                    let groupAttrs: [Partial<DatePickerProps>, Partial<TimePickerProps>] = [{}, {}]
                    if (has(rows, 'groupProps') && isArray(rows['groupProps'])) {
                        const [dateAttrs, timeAttrs] = rows['groupProps'];
                        if (dateAttrs) {
                            groupAttrs[0] = {
                                ...dateAttrs,
                                minDate: dateAttrs['minDate'] || new Date(curYear - 20, 1, 1),
                                maxDate: dateAttrs['maxDate'] || new Date(curYear + 10, 12, 31)
                            };
                        }
                        if (timeAttrs) {
                            groupAttrs[1] = timeAttrs
                        }
                    }
                    return groupAttrs
                }
                const renderComp = () => {
                    let curShowType = has(orgAttrs.value, 'showType') && ['group', 'single'].includes(orgAttrs.value['showType']) ? orgAttrs.value['showType'] : 'group';
                    switch (curShowType) {
                        case 'group':
                            const dateTimeValue = ref({
                                date: isArray(formValue.value[name.value]) && formValue.value[name.value].length > 0 ? formValue.value[name.value][0] : [],
                                time: isArray(formValue.value[name.value]) && formValue.value[name.value].length > 1 ? formValue.value[name.value][1] : []
                            })

                            return <PickerGroup
                                title={`请选择${label.value}`}
                                {...eventsCollector()}
                                {...curAttrs}
                                tabs={has(curAttrs, 'tabs') ? curAttrs['tabs'] : ['选择日期', '选择时间']}
                                onConfirm={(...args: any) => {
                                    formValue.value[name.value] = [dateTimeValue.value.date, dateTimeValue.value.time]
                                    formValue.value[`${name.value}Text`] = `${dateTimeValue.value.date.join('-')} ${dateTimeValue.value.time.join(':')}`
                                    closePopup()
                                    onEvents('confirm', name.value, ...args)
                                }}
                                onChange={(...args: any) => onEvents('change', name.value, ...args)}
                                onCancel={onCancel}
                                v-slots={handlerCompSlots()}
                            >
                                <DatePicker
                                    v-model={dateTimeValue.value.date}
                                    {...defaultDateTime(curAttrs)[0]}
                                />
                                <TimePicker
                                    v-model={dateTimeValue.value.time}
                                    {...defaultDateTime(curAttrs)[1]}
                                />
                            </PickerGroup>;
                        case 'single':
                            return <XDatetimePicker v-model={formValue.value[name.value]}
                                                    title={`请选择${label.value}`}
                                                    {...eventsCollector()}
                                                    {...(has(curAttrs, 'groupProps') ? curAttrs['groupProps'] : {})}
                                                    onConfirm={(...args: any) => {
                                                        const [{selectedValues}] = args as PickerConfirmEventParams[]
                                                        formValue.value[name.value] = selectedValues
                                                        const dateTime = `${selectedValues.slice(0, 3).join('-')} ${selectedValues.slice(3).join(':')}`
                                                        formValue.value[`${name.value}Text`] = dateTime
                                                        closePopup()
                                                        onEvents('confirm', name.value, ...args)
                                                    }}
                                                    onChange={(...args: any) => onEvents('change', name.value, ...args)}
                                                    onCancel={onCancel}
                                                    v-slots={handlerCompSlots()}
                            />;
                    }
                }
                return <>
                    <Field v-model={formValue.value[`${name.value}Text`]} {...getBasicConfig()}
                           v-slots={handlerSlot()}/>
                    {/* 日期时间选择器Popup */}
                    {renderPopup(renderComp())}
                </>
            },
            'date-range-picker': () => {
                const curYear = new Date().getFullYear();
                const drValue = ref({
                    start: isArray(formValue.value[name.value]) && formValue.value[name.value].length > 0 ? formValue.value[name.value][0] : [],
                    end: isArray(formValue.value[name.value]) && formValue.value[name.value].length > 1 ? formValue.value[name.value][1] : []
                })
                const curAttrs = orgAttrs.value as CompAttrsPropsMap['date-range-picker']
                const defaultDate = (rows: CompAttrsPropsMap['date-range-picker']) => {
                    let dateGroup: [Partial<DatePickerProps>, Partial<DatePickerProps>] = [{}, {}]
                    if (has(rows, 'groupProps') && isArray(rows['groupProps'])) {
                        const [startDateGroup, endDateGroup] = rows['groupProps'] || []
                        if (startDateGroup) {
                            dateGroup[0] = startDateGroup;
                            dateGroup[0]['minDate'] = startDateGroup['minDate'] || new Date(curYear - 20, 1, 1)
                            dateGroup[0]['maxDate'] = startDateGroup['maxDate'] || new Date(curYear + 10, 1, 1)
                        }
                        if (endDateGroup) {
                            dateGroup[1] = endDateGroup;
                            dateGroup[1]['minDate'] = startDateGroup['minDate'] || new Date(curYear - 20, 1, 1)
                            dateGroup[1]['maxDate'] = startDateGroup['maxDate'] || new Date(curYear + 10, 1, 1)
                        }
                    }
                    return dateGroup
                }

                return <>
                    <Field v-model={formValue.value[`${name.value}Text`]} {...getBasicConfig()}
                           v-slots={handlerSlot()}/>

                    {/* 日期范围选择器Popup */}
                    {renderPopup(<PickerGroup
                        title={`请选择${label.value}`}
                        {...eventsCollector()}
                        {...curAttrs}
                        tabs={has(curAttrs, 'tabs') ? curAttrs['tabs'] : ['开始日期', '结束日期']}
                        onConfirm={(...args: any) => {
                            formValue.value[name.value] = [drValue.value.start, drValue.value.end]
                            formValue.value[`${name.value}Text`] = `${drValue.value.start.join('-')} 至 ${drValue.value.end.join('-')}`
                            closePopup()
                            onEvents('confirm', name.value, ...args)
                        }}
                        onChange={(...args: any) => onEvents('change', name.value, ...args)}
                        onCancel={closePopup}
                        v-slots={handlerCompSlots()}
                    >
                        <DatePicker
                            v-model={drValue.value.start}
                            {...defaultDate(curAttrs)[0]}
                        />
                        <DatePicker
                            v-model={drValue.value.end}
                            {...defaultDate(curAttrs)[1]}
                        />
                    </PickerGroup>)}
                </>
            },
            'time-range-picker': () => {
                const trValue = ref({
                    start: isArray(formValue.value[name.value]) && formValue.value[name.value].length > 0 ? formValue.value[name.value][0] : [],
                    end: isArray(formValue.value[name.value]) && formValue.value[name.value].length > 1 ? formValue.value[name.value][1] : []
                })

                const curAttrs = orgAttrs.value as CompAttrsPropsMap['time-range-picker']
                const defaultTime = (rows: CompAttrsPropsMap['time-range-picker']) => {
                    let startTimeAttrs = {}
                    let endTimeAttrs = {}
                    if (has(rows, 'groupProps') && isArray(rows['groupProps'])) {
                        const [startProps, endProps] = rows['groupProps'];
                        if (startProps) {
                            startTimeAttrs = startProps
                        }
                        if (endProps) {
                            endTimeAttrs = endProps
                        }
                    }
                    return [startTimeAttrs, endTimeAttrs]
                }
                return <>
                    <Field v-model={formValue.value[`${name.value}Text`]}  {...getBasicConfig()}
                           v-slots={handlerSlot()}/>
                    {/* 日期时间选择器Popup */}
                    {renderPopup(<PickerGroup
                        title={`请选择${label.value}`}
                        {...eventsCollector()}
                        {...curAttrs}
                        tabs={has(curAttrs, 'tabs') ? curAttrs['tabs'] : ['开始时间', '结束时间']}
                        onConfirm={(...args: any) => {
                            closePopup()
                            formValue.value[name.value] = [trValue.value.start, trValue.value.end]
                            formValue.value[`${name.value}Text`] = `${trValue.value.start.join(':')} 至 ${trValue.value.end.join(':')}`
                            onEvents('confirm', name.value, ...args)
                        }}
                        onChange={(...args: any) => onEvents('change', name.value, ...args)}
                        onCancel={closePopup}
                        v-slots={handlerCompSlots()}
                    >
                        <TimePicker v-model={trValue.value.start} {...defaultTime(curAttrs)[0]} />
                        <TimePicker v-model={trValue.value.end} {...defaultTime(curAttrs)[1]} />
                    </PickerGroup>)}
                </>
            },
            'datetime-range-picker': () => {
                const dtrValue = ref({
                    start: isArray(formValue.value[name.value]) && formValue.value[name.value].length > 0 ? formValue.value[name.value][0] : [],
                    end: isArray(formValue.value[name.value]) && formValue.value[name.value].length > 1 ? formValue.value[name.value][1] : [],
                })

                const curAttrs = orgAttrs.value as CompAttrsPropsMap['datetime-range-picker']

                const handleDatetimeAttrs = (rows: CompAttrsPropsMap['datetime-range-picker']) => {
                    let startAttrs = {}
                    let endAttrs = {}
                    if (has(rows, 'groupProps') && isArray(rows['groupProps'])) {
                        const [startProps, endProps] = rows['groupProps'];
                        if (startProps) {
                            startAttrs = startProps
                        }
                        if (endProps) {
                            endAttrs = endProps
                        }
                    }
                    return [startAttrs, endAttrs]
                }
                return <>
                    <Field v-model={formValue.value[`${name.value}Text`]} {...getBasicConfig()}
                           v-slots={handlerSlot()}/>
                    {/* 日期时间选择器Popup */}
                    {renderPopup(<PickerGroup
                        title={`请选择${label.value}`}
                        {...eventsCollector()}
                        {...curAttrs}
                        tabs={has(curAttrs, 'tabs') ? curAttrs['tabs'] : ['开始时间', '结束时间']}
                        onConfirm={(...args: any) => {
                            const {start, end} = dtrValue.value
                            formValue.value[name.value] = [dtrValue.value.start, dtrValue.value.end]
                            const startStr = `${start.slice(0, 3).join('-')} ${start.slice(3).join(':')}`
                            const sendStr = `${end.slice(0, 3).join('-')} ${end.slice(3).join(':')}`
                            formValue.value[`${name.value}Text`] = `${startStr} 至 ${sendStr}`;
                            closePopup()
                            onEvents('confirm', name.value, ...args)
                        }}
                        onChange={(...args: any) => onEvents('change', name.value, ...args)}
                        onCancel={closePopup}
                        v-slots={handlerCompSlots()}
                    >
                        <XDatetimePicker v-model={dtrValue.value.start} {...handleDatetimeAttrs(curAttrs)[0]} />
                        <XDatetimePicker v-model={dtrValue.value.end} {...handleDatetimeAttrs(curAttrs)[1]} />
                    </PickerGroup>)}
                </>
            },
            // 'calender': () => {
            //     return <>
            //         <Field v-model={formValue.value[`${name}Text`]}  {...getBasicConfig()} v-slots={handlerSlot()} />
            //         <Calendar
            //             v-model={formValue.value[name]}
            //             onUpdate:show={(val: boolean) => (showPopup.value = val)}
            //             title={`请选择${label}`}
            //             {...eventsCollector()}
            //             {...(orgAttrs as CompAttrsPropsMap['calender'])}
            //             show={showPopup.value}
            //             onConfirm={(...args: any) => {
            //                 // console.log('calender', args);
            //                 formValue.value[`${name}Text`] = formValue.value[name].map((item: any) => dayjs(item).format('YYYY-MM-DD')).join('、')
            //                 closePopup()
            //                 onEvents('confirm', name, ...args)
            //             }}
            //             onChange={(...args: any) => {
            //                 onEvents('change', name, ...args)
            //             }}
            //             onPanelChange={(...args: any) => onEvents('panel-change', name, ...args)}
            //             onSelect={(...args: any) => onEvents('select', name, ...args)}
            //             onOpen={(...args: any) => onEvents('open', name, ...args)}
            //             onClose={(...args: any) => onEvents('close', name, ...args)}
            //             onOpened={(...args: any) => onEvents('opened', name, ...args)}
            //             onClosed={(...args: any) => onEvents('closed', name, ...args)}
            //             onUnselect={(...args: any) => onEvents('unselec', name, ...args)}
            //             onMonthShow={(...args: any) => onEvents('month-show', name, ...args)}
            //             onOverRange={(...args: any) => onEvents('over-range', name, ...args)}
            //             onClickDisabledDate={(...args: any) => onEvents('click-disabled-date', name, ...args)}
            //             onClickSubtitle={(...args: any) => onEvents('click-subtitle', name, ...args)}
            //             onCancel={onCancel}
            //             v-slots={handlerCompSlots()}      
            //         />,
            //     </>
            // },
            'radio': () => {
                return <Field {...getBasicConfig()}
                              v-slots={{
                                  input: () => <RadioGroup
                                      v-model={formValue.value[name.value]}
                                      {...eventsCollector()}
                                      {...(orgAttrs.value as CompAttrsPropsMap['radio'])}
                                      class={{'readonly-radio': readonly.value}}
                                      disabled={readonly.value || (has(orgAttrs.value, 'disabled') && (!!orgAttrs.value.disabled))}
                                      v-slots={handlerCompSlots()}
                                  >
                                      {options.value?.map((item: any) => {
                                          return <Radio  {...item.attrs} name={item.value}>{item.text}</Radio>
                                      })}
                                  </RadioGroup>
                              }}
                />
            },
            'checkbox': () => {
                return <Field
                    {...getBasicConfig()}
                    v-slots={{
                        ...handlerSlot(),
                        input: () => {
                            return <CheckboxGroup
                                v-model={formValue.value[name.value]}
                                {...eventsCollector()}
                                {...(orgAttrs.value as CompAttrsPropsMap['checkbox'])}
                                class={{'readonly-checkbox': readonly.value}}
                                disabled={readonly.value || (has(orgAttrs.value, 'disabled') && (!!orgAttrs.value.disabled))}
                                v-slots={handlerCompSlots()}
                            >
                                {options.value?.map((item: any) => {
                                    return <Checkbox  {...item.attrs} name={item.value}>{item.text}</Checkbox>
                                })}
                            </CheckboxGroup>
                        }
                    }}
                />
            },
            'switch': () => {
                return <Field
                    {...getBasicConfig()}
                    v-slots={{
                        ...handlerSlot(),
                        input: () => {
                            return <Switch v-model={formValue.value[name.value]}
                                           {...eventsCollector()}
                                           {...(orgAttrs.value as CompAttrsPropsMap['switch'])}
                                           class={{'readonly-switch': readonly.value}}
                                           disabled={readonly.value || (has(orgAttrs.value, 'disabled') && (!!orgAttrs.value.disabled))}
                                           v-slots={handlerCompSlots()}
                            />
                        }
                    }}
                />
            },
            'rate': () => {
                return <Field
                    {...getBasicConfig()}
                    v-slots={{
                        ...handlerSlot(),
                        input: () => {
                            return <Rate v-model={formValue.value[name.value]}
                                         {...eventsCollector()}
                                         {...(orgAttrs.value as CompAttrsPropsMap['rate'])}
                                         readonly={readonly.value || (has(orgAttrs.value, 'readonly') && (!!orgAttrs.value.readonly))}
                                         v-slots={handlerCompSlots()}
                            />
                        }
                    }}
                />

            },
            'slider': () => {
                return <Field
                    {...getBasicConfig()}
                    v-slots={{
                        ...handlerSlot(),
                        input: () => {
                            return <Slider v-model={formValue.value[name.value]}
                                           {...eventsCollector()}
                                           {...(orgAttrs.value as CompAttrsPropsMap['slider'])}
                                           class={{'readonly-slider': readonly.value}}
                                           disabled={readonly.value || (has(orgAttrs.value, 'disabled') && (!!orgAttrs.value.disabled))}
                                           onDragStart={(...args: any) => {
                                               onEvents('drag-start', name.value, ...args)
                                           }}
                                           onDragEnd={(...args: any) => {
                                               onEvents('drag-end', name.value, ...args)
                                           }}
                                           v-slots={handlerCompSlots()}
                            />
                        }
                    }}
                />

            },
            'stepper': () => {
                return <Field
                    {...getBasicConfig()}
                    v-slots={{
                        ...handlerSlot(),
                        input: () => {
                            return <Stepper v-model={formValue.value[name.value]}
                                            {...eventsCollector()}
                                            {...(orgAttrs.value as CompAttrsPropsMap['stepper'])}
                                            class={{'readonly-stepper': readonly.value}}
                                            disabled={readonly.value || (has(orgAttrs.value, 'disabled') && (!!orgAttrs.value.disabled))}
                                            onPlus={(...args: any) => {
                                                onEvents('plus', name.value, ...args)
                                            }}
                                            onMinus={(...args: any) => {
                                                onEvents('minus', name.value, ...args)
                                            }}
                                            onOverlimit={(...args: any[]) => {
                                                onEvents('overlimit', name.value, ...args)
                                            }}
                                            v-slots={handlerCompSlots()}
                            />
                        }
                    }}
                />
            },
            'text': () => <Field
                {...getBasicConfig()}
                v-slots={{
                    ...handlerSlot(),
                    input: () => {
                        return <>{formValue.value[name.value]}</>
                    }
                }}
            />,
            'html': () => <Field
                {...getBasicConfig()}
                v-slots={{
                    ...handlerSlot(),
                    input: () => <div
                        v-html={formValue.value[name.value]} {...(orgAttrs.value as CompAttrsPropsMap['html'])}></div>
                }}
            />,
            'input-slot': () => <Field
                {...getBasicConfig()}
                v-slots={{
                    ...handlerSlot(),
                    input: () => <>
                        {has(formSlots, name.value) ? renderSlot(formSlots, name.value) : <></>}
                    </>
                }}
            />,
            'slot': () => <>{has(formSlots, name.value) ? renderSlot(formSlots, name.value, {
                ...getBasicConfig()
            }) : <></>}
            </>
        }

        const renderPopup = (comp: any, popupConfig: Indexable = {}) => {
            return <Popup
                show={showPopup.value}
                onUpdate:show={(val: boolean) => (showPopup.value = val)}
                destroy-on-close
                round
                position="bottom"
                {...popupConfig}
                {...popup.value}
            >
                {comp}
            </Popup>
        }
        return () => {
            return <>
                {compGenerator[type.value]()}
            </>
        }
    },

})
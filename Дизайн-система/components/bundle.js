/* @ds-bundle: {"format":4,"namespace":"Cabinet","components":[{"name":"Icon"},{"name":"Button"},{"name":"Chip"},{"name":"TextField"},{"name":"Badge"},{"name":"Card"},{"name":"MetricTile"},{"name":"PaymentLoadMeter"},{"name":"ProductCard"},{"name":"Stepper"},{"name":"StatusTracker"},{"name":"ChatMessage"},{"name":"ChatComposer"},{"name":"Alert"},{"name":"DocumentUpload"}]} */
(function () {
"use strict";
var exports = {};
var module = { exports: exports };
var require = function (m) { if (m === "react") return window.React; throw new Error("Cabinet bundle: unknown module " + m); };
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMoney = formatMoney;
exports.formatPercent = formatPercent;
exports.Icon = Icon;
exports.Button = Button;
exports.Chip = Chip;
exports.TextField = TextField;
exports.Badge = Badge;
exports.Card = Card;
exports.MetricTile = MetricTile;
exports.PaymentLoadMeter = PaymentLoadMeter;
exports.ProductCard = ProductCard;
exports.Stepper = Stepper;
exports.StatusTracker = StatusTracker;
exports.ChatMessage = ChatMessage;
exports.ChatComposer = ChatComposer;
exports.Alert = Alert;
exports.DocumentUpload = DocumentUpload;
const React = __importStar(require("react"));
const cx = (...parts) => parts.filter(Boolean).join(' ');
const NBSP = ' ';
function formatMoney(value, opts = {}) {
    const { currency = true, decimals = 0 } = opts;
    const n = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.,-]/g, '').replace(',', '.'));
    if (!isFinite(n) || String(value).trim() === '')
        return '';
    const fixed = Math.abs(n).toFixed(decimals);
    const [int, frac] = fixed.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    const body = (n < 0 ? '−' : '') + grouped + (frac ? ',' + frac : '');
    return currency ? body + NBSP + '₽' : body;
}
function formatPercent(value, decimals = 1) {
    const s = value.toFixed(decimals).replace(/\.0+$/, '').replace('.', ',');
    return s + '%';
}
const ICONS = {
    'sparkle': React.createElement("g", { fill: "currentColor", stroke: "none" },
        React.createElement("path", { d: "M11 4l1.9 7.1L20 13l-7.1 1.9L11 22l-1.9-7.1L2 13l7.1-1.9z" }),
        React.createElement("path", { d: "M19 1.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z" })),
    'arrow-up': React.createElement("path", { d: "M12 19V5M5.5 11.5L12 5l6.5 6.5" }),
    'arrow-down': React.createElement("path", { d: "M12 5v14M18.5 12.5L12 19l-6.5-6.5" }),
    'paperclip': React.createElement("path", { d: "M20 11.5l-7.8 7.8a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8" }),
    'document': React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" }),
        React.createElement("path", { d: "M14 3v5h5M9 13h6M9 17h4" })),
    'upload': React.createElement("path", { d: "M12 15V4M7.5 8.5L12 4l4.5 4.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" }),
    'check': React.createElement("path", { d: "M5 12.5l4.5 4.5L19 7.5" }),
    'check-circle': React.createElement(React.Fragment, null,
        React.createElement("circle", { cx: "12", cy: "12", r: "9" }),
        React.createElement("path", { d: "M8 12.5l2.8 2.8L16 10" })),
    'clock': React.createElement(React.Fragment, null,
        React.createElement("circle", { cx: "12", cy: "12", r: "9" }),
        React.createElement("path", { d: "M12 7.5V12l3 2" })),
    'alert': React.createElement("path", { d: "M10.3 4.2L2.8 17.5a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0zM12 9.5v4M12 17h.01" }),
    'info': React.createElement(React.Fragment, null,
        React.createElement("circle", { cx: "12", cy: "12", r: "9" }),
        React.createElement("path", { d: "M12 11v5M12 7.8h.01" })),
    'x': React.createElement("path", { d: "M6 6l12 12M18 6L6 18" }),
    'x-circle': React.createElement(React.Fragment, null,
        React.createElement("circle", { cx: "12", cy: "12", r: "9" }),
        React.createElement("path", { d: "M9 9l6 6M15 9l-6 6" })),
    'chevron-right': React.createElement("path", { d: "M9.5 6l6 6-6 6" }),
    'wallet': React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M4 7.5A2.5 2.5 0 0 1 6.5 5H17a1 1 0 0 1 1 1v2" }),
        React.createElement("path", { d: "M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5zM16 13.5h.01" })),
    'calendar': React.createElement(React.Fragment, null,
        React.createElement("rect", { x: "3.5", y: "5", width: "17", height: "15", rx: "2" }),
        React.createElement("path", { d: "M3.5 10h17M8 3v4M16 3v4" })),
    'shield': React.createElement("path", { d: "M12 3l7 3v5.5c0 4.3-3 7.9-7 9.5-4-1.6-7-5.2-7-9.5V6zM9 12l2 2 4-4" }),
    'circle': React.createElement("circle", { cx: "12", cy: "12", r: "9" }),
    'trend-up': React.createElement("path", { d: "M4 16l5.5-5.5 4 4L20 8M15 8h5v5" }),
    'trend-down': React.createElement("path", { d: "M4 8l5.5 5.5 4-4L20 16M15 16h5v-5" }),
};
function Icon({ name, size = 20, title, className, ...rest }) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round", className: cx('kk-icon', className), "aria-hidden": title ? undefined : true, role: title ? 'img' : undefined, focusable: "false", ...rest },
        title ? React.createElement("title", null, title) : null,
        ICONS[name]));
}
function Button({ variant = 'secondary', size = 'md', loading = false, iconLeft, iconRight, fullWidth, className, children, disabled, type = 'button', ...rest }) {
    const iconSize = size === 'sm' ? 16 : 20;
    return (React.createElement("button", { type: type, ...rest, disabled: disabled || loading, "aria-busy": loading || undefined, className: cx('kk-btn', 'kk-btn--' + variant, 'kk-btn--' + size, fullWidth && 'kk-btn--full', loading && 'is-loading', className) },
        loading ? React.createElement("span", { className: "kk-spinner", "aria-hidden": "true" }) : iconLeft ? React.createElement(Icon, { name: iconLeft, size: iconSize }) : null,
        children != null ? React.createElement("span", { className: "kk-btn__label" }, children) : null,
        !loading && iconRight ? React.createElement(Icon, { name: iconRight, size: iconSize }) : null));
}
function Chip({ selected = false, icon, className, children, type = 'button', ...rest }) {
    return (React.createElement("button", { type: type, "aria-pressed": selected, ...rest, className: cx('kk-chip', selected && 'is-selected', className) },
        icon ? React.createElement(Icon, { name: icon, size: 16 }) : null,
        React.createElement("span", null, children)));
}
function TextField({ label, hint, error, suffix, prefilled, format = 'text', id, className, onChange, inputMode, ...rest }) {
    const autoId = React.useId();
    const fid = id || autoId;
    const msgId = fid + '-msg';
    const handle = (e) => {
        if (format === 'money') {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 13);
            e.target.value = digits ? formatMoney(digits, { currency: false }) : '';
        }
        if (onChange)
            onChange(e);
    };
    const tail = suffix != null ? suffix : format === 'money' ? '₽' : null;
    return (React.createElement("div", { className: cx('kk-field', error ? 'is-invalid' : null, prefilled && 'is-prefilled', className) },
        React.createElement("div", { className: "kk-field__top" },
            React.createElement("label", { htmlFor: fid, className: "kk-field__label label" }, label),
            prefilled ? React.createElement("span", { className: "kk-field__tag caption" },
                React.createElement(Icon, { name: "sparkle", size: 14 }),
                "\u0417\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u043E \u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442\u043E\u043C") : null),
        React.createElement("div", { className: "kk-field__control" },
            React.createElement("input", { id: fid, ...rest, onChange: handle, inputMode: format === 'money' ? 'numeric' : inputMode, "aria-invalid": error ? true : undefined, "aria-describedby": error || hint ? msgId : undefined, className: cx('kk-field__input', format === 'money' && 'kk-num') }),
            tail != null ? React.createElement("span", { className: "kk-field__suffix", "aria-hidden": "true" }, tail) : null),
        error
            ? React.createElement("p", { id: msgId, className: "kk-field__msg kk-field__msg--error body-sm" },
                React.createElement(Icon, { name: "alert", size: 16 }),
                error)
            : hint ? React.createElement("p", { id: msgId, className: "kk-field__msg body-sm" }, hint) : null));
}
const TONE_ICON = {
    neutral: null, success: 'check-circle', warning: 'alert', danger: 'x-circle', info: 'clock', accent: 'sparkle',
};
function Badge({ tone = 'neutral', icon, children, className }) {
    const name = icon === false ? null : icon || TONE_ICON[tone];
    return (React.createElement("span", { className: cx('kk-badge', 'kk-badge--' + tone, 'caption', className) },
        name ? React.createElement(Icon, { name: name, size: 14 }) : null,
        children));
}
function Card({ padding = 'md', interactive, tone = 'default', as = 'div', className, children, ...rest }) {
    return React.createElement(as, { ...rest, className: cx('kk-card', 'kk-card--' + padding, tone === 'accent' && 'kk-card--accent', interactive && 'kk-card--interactive', className) }, children);
}
function MetricTile({ label, value, icon, delta, hint, className }) {
    return (React.createElement("div", { className: cx('kk-metric', className) },
        React.createElement("div", { className: "kk-metric__top" },
            React.createElement("span", { className: "kk-metric__label body-sm" }, label),
            icon ? React.createElement("span", { className: "kk-metric__icon" },
                React.createElement(Icon, { name: icon, size: 20 })) : null),
        React.createElement("div", { className: "kk-metric__value amount-lg kk-num" }, value),
        delta ? (React.createElement("div", { className: cx('kk-metric__delta', 'body-sm', 'is-' + (delta.tone || 'neutral')) },
            React.createElement(Icon, { name: delta.direction === 'up' ? 'trend-up' : 'trend-down', size: 16 }),
            React.createElement("span", { className: "kk-num" }, delta.value),
            delta.label ? React.createElement("span", { className: "kk-metric__delta-label" }, delta.label) : null)) : null,
        hint ? React.createElement("div", { className: "kk-metric__hint body-sm" }, hint) : null));
}
function PaymentLoadMeter({ payment, cashFlow, warnAt = 0.3, riskAt = 0.5, title = 'Нагрузка на бизнес', className }) {
    const share = cashFlow > 0 ? payment / cashFlow : 1;
    const zone = share < warnAt ? 'safe' : share < riskAt ? 'warn' : 'risk';
    const max = Math.min(1, Math.max(riskAt + 0.2, share + 0.05));
    const pos = (x) => Math.min(100, (x / max) * 100) + '%';
    const words = { safe: 'Комфортно', warn: 'На грани', risk: 'Высокая нагрузка' };
    const icons = { safe: 'check-circle', warn: 'alert', risk: 'x-circle' };
    const pct = Math.round(share * 100);
    return (React.createElement("div", { className: cx('kk-meter', 'is-' + zone, className) },
        React.createElement("div", { className: "kk-meter__top" },
            React.createElement("span", { className: "kk-meter__title label" }, title),
            React.createElement("span", { className: "kk-meter__zone body-strong" },
                React.createElement(Icon, { name: icons[zone], size: 16 }),
                words[zone])),
        React.createElement("div", { className: "kk-meter__track", role: "meter", "aria-label": title, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": pct, "aria-valuetext": pct + '% от чистого потока, ' + words[zone].toLowerCase() },
            React.createElement("span", { className: "kk-meter__fill", style: { width: pos(share) } }),
            React.createElement("span", { className: "kk-meter__tick", style: { left: pos(warnAt) } }),
            React.createElement("span", { className: "kk-meter__tick", style: { left: pos(riskAt) } })),
        React.createElement("div", { className: "kk-meter__scale caption", "aria-hidden": "true" },
            React.createElement("span", { style: { left: pos(warnAt) } },
                Math.round(warnAt * 100),
                "%"),
            React.createElement("span", { style: { left: pos(riskAt) } },
                Math.round(riskAt * 100),
                "%")),
        React.createElement("p", { className: "kk-meter__text body-sm" },
            "\u041F\u043B\u0430\u0442\u0451\u0436 ",
            React.createElement("b", { className: "kk-num" }, formatMoney(payment)),
            " \u0432 \u043C\u0435\u0441\u044F\u0446 \u2014 ",
            React.createElement("b", { className: "kk-num" },
                pct,
                "%"),
            " \u043E\u0442 \u0441\u0440\u0435\u0434\u043D\u0435\u043C\u0435\u0441\u044F\u0447\u043D\u043E\u0433\u043E \u0447\u0438\u0441\u0442\u043E\u0433\u043E \u043F\u043E\u0442\u043E\u043A\u0430 ",
            React.createElement("span", { className: "kk-num" }, formatMoney(cashFlow)))));
}
function ProductCard({ name, purpose, amount, amountLabel = 'Лимит', params = [], reasons = [], recommended = false, preliminary = true, primaryAction, secondaryAction, children, className, }) {
    const headingId = React.useId();
    return (React.createElement("article", { className: cx('kk-product', recommended && 'is-recommended', className), "aria-labelledby": headingId },
        recommended ? React.createElement("div", { className: "kk-product__flag" },
            React.createElement(Badge, { tone: "accent" }, "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u043C")) : null,
        React.createElement("h3", { id: headingId, className: "kk-product__name title-3" }, name),
        purpose ? React.createElement("p", { className: "kk-product__purpose body" }, purpose) : null,
        React.createElement("div", { className: "kk-product__amount" },
            React.createElement("span", { className: "label" }, amountLabel),
            React.createElement("span", { className: "amount-xl kk-num" }, amount)),
        params.length ? (React.createElement("dl", { className: "kk-product__params" }, params.map((p, i) => (React.createElement("div", { key: i, className: "kk-product__param" },
            React.createElement("dt", { className: "label" }, p.label),
            React.createElement("dd", { className: "amount-md kk-num" }, p.value)))))) : null,
        children ? React.createElement("div", { className: "kk-product__slot" }, children) : null,
        reasons.length ? (React.createElement("div", { className: "kk-product__reasons" },
            React.createElement("p", { className: "body-strong" }, "\u041F\u043E\u0447\u0435\u043C\u0443 \u043F\u043E\u0434\u0445\u043E\u0434\u0438\u0442"),
            React.createElement("ul", null, reasons.map((r, i) => React.createElement("li", { key: i, className: "body" },
                React.createElement(Icon, { name: "check", size: 20 }),
                r))))) : null,
        preliminary ? (React.createElement("p", { className: "kk-product__note body-sm" },
            React.createElement(Icon, { name: "info", size: 16 }),
            "\u041F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u043E\u0446\u0435\u043D\u043A\u0430 \u043F\u043E \u0434\u0430\u043D\u043D\u044B\u043C \u0432\u0430\u0448\u0435\u0433\u043E \u0441\u0447\u0451\u0442\u0430. \u0420\u0435\u0448\u0435\u043D\u0438\u0435 \u043F\u0440\u0438\u043D\u0438\u043C\u0430\u0435\u0442 \u0431\u0430\u043D\u043A.")) : null,
        primaryAction || secondaryAction ? (React.createElement("div", { className: "kk-product__actions" },
            primaryAction ? React.createElement(Button, { variant: "primary", onClick: primaryAction.onClick }, primaryAction.label) : null,
            secondaryAction ? React.createElement(Button, { variant: "ghost", onClick: secondaryAction.onClick }, secondaryAction.label) : null)) : null));
}
function Stepper({ steps, current, className }) {
    return (React.createElement("ol", { className: cx('kk-stepper', className), "aria-label": 'Шаг ' + (current + 1) + ' из ' + steps.length }, steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
        return (React.createElement("li", { key: i, className: cx('kk-step', 'is-' + state), "aria-current": state === 'current' ? 'step' : undefined },
            React.createElement("span", { className: "kk-step__marker kk-num", "aria-hidden": "true" }, state === 'done' ? React.createElement(Icon, { name: "check", size: 16 }) : i + 1),
            React.createElement("span", { className: "kk-step__text" },
                React.createElement("span", { className: "kk-step__label body-strong" }, s.label),
                s.description ? React.createElement("span", { className: "kk-step__desc body-sm" }, s.description) : null,
                React.createElement("span", { className: "kk-sr" }, state === 'done' ? ' — готово' : state === 'current' ? ' — текущий шаг' : ''))));
    })));
}
const STAGE_ICON = {
    done: 'check-circle', current: 'clock', pending: 'circle', attention: 'alert', failed: 'x-circle',
};
const STAGE_WORD = {
    done: 'готово', current: 'сейчас', pending: 'впереди', attention: 'нужно ваше действие', failed: 'не пройдено',
};
function StatusTracker({ stages, className }) {
    return (React.createElement("ol", { className: cx('kk-tracker', className) }, stages.map((s, i) => (React.createElement("li", { key: i, className: cx('kk-stage', 'is-' + s.status), "aria-current": s.status === 'current' ? 'step' : undefined },
        React.createElement("span", { className: "kk-stage__rail", "aria-hidden": "true" },
            React.createElement("span", { className: "kk-stage__icon" },
                React.createElement(Icon, { name: STAGE_ICON[s.status], size: 24 }))),
        React.createElement("div", { className: "kk-stage__body" },
            React.createElement("div", { className: "kk-stage__head" },
                React.createElement("span", { className: "kk-stage__title body-strong" },
                    s.title,
                    React.createElement("span", { className: "kk-sr" },
                        " \u2014 ",
                        STAGE_WORD[s.status])),
                s.time ? React.createElement("span", { className: "kk-stage__time body-sm kk-num" }, s.time) : null),
            s.description ? React.createElement("div", { className: "kk-stage__desc body-sm" }, s.description) : null,
            s.action ? React.createElement("div", { className: "kk-stage__action" }, s.action) : null))))));
}
function ChatMessage({ role, children, time, typing = false, footer, className }) {
    const isAssistant = role === 'assistant';
    return (React.createElement("div", { className: cx('kk-msg', 'kk-msg--' + role, className) },
        isAssistant ? React.createElement("span", { className: "kk-msg__avatar", "aria-hidden": "true" },
            React.createElement(Icon, { name: "sparkle", size: 18 })) : null,
        React.createElement("div", { className: "kk-msg__col" },
            React.createElement("span", { className: "kk-sr" }, isAssistant ? 'Ассистент:' : 'Вы:'),
            React.createElement("div", { className: cx('kk-msg__bubble', isAssistant ? 'body-lg' : 'body') }, typing
                ? React.createElement("span", { className: "kk-typing", role: "status", "aria-label": "\u0410\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442 \u043F\u0435\u0447\u0430\u0442\u0430\u0435\u0442" },
                    React.createElement("i", null),
                    React.createElement("i", null),
                    React.createElement("i", null))
                : children),
            footer ? React.createElement("div", { className: "kk-msg__footer" }, footer) : null,
            time ? React.createElement("span", { className: "kk-msg__time caption kk-num" }, time) : null)));
}
function ChatComposer({ value, defaultValue = '', onChange, onSend, onAttach, placeholder = 'Опишите задачу своими словами', disabled = false, hint = 'Ассистент может ошибаться. Решение по кредиту принимает банк.', className, }) {
    const [inner, setInner] = React.useState(defaultValue);
    const text = value !== undefined ? value : inner;
    const ref = React.useRef(null);
    React.useLayoutEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 132) + 'px';
    }, [text]);
    const set = (v) => { if (value === undefined)
        setInner(v); if (onChange)
        onChange(v); };
    const send = () => {
        const v = text.trim();
        if (!v || disabled)
            return;
        if (onSend)
            onSend(v);
        set('');
    };
    return (React.createElement("div", { className: cx('kk-composer', disabled && 'is-disabled', className) },
        React.createElement("div", { className: "kk-composer__box" },
            onAttach ? (React.createElement("button", { type: "button", className: "kk-iconbtn", onClick: onAttach, disabled: disabled, "aria-label": "\u041F\u0440\u0438\u043A\u0440\u0435\u043F\u0438\u0442\u044C \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442" },
                React.createElement(Icon, { name: "paperclip", size: 20 }))) : null,
            React.createElement("textarea", { ref: ref, rows: 1, className: "kk-composer__input body", value: text, placeholder: placeholder, "aria-label": placeholder, disabled: disabled, onChange: (e) => set(e.target.value), onKeyDown: (e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        send();
                    }
                } }),
            React.createElement("button", { type: "button", className: "kk-composer__send", onClick: send, disabled: disabled || !text.trim(), "aria-label": "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C" },
                React.createElement(Icon, { name: "arrow-up", size: 20 }))),
        hint ? React.createElement("p", { className: "kk-composer__hint caption" }, hint) : null));
}
const ALERT_ICON = {
    info: 'info', success: 'check-circle', warning: 'alert', danger: 'x-circle', assistant: 'sparkle',
};
function Alert({ tone = 'info', title, children, action, onClose, className }) {
    return (React.createElement("div", { className: cx('kk-alert', 'kk-alert--' + tone, className), role: tone === 'danger' ? 'alert' : 'status' },
        React.createElement("span", { className: "kk-alert__icon" },
            React.createElement(Icon, { name: ALERT_ICON[tone], size: 20 })),
        React.createElement("div", { className: "kk-alert__body" },
            title ? React.createElement("p", { className: "kk-alert__title body-strong" }, title) : null,
            children ? React.createElement("div", { className: "kk-alert__text body-sm" }, children) : null,
            action ? React.createElement("div", { className: "kk-alert__action" }, action) : null),
        onClose ? (React.createElement("button", { type: "button", className: "kk-iconbtn kk-alert__close", onClick: onClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" },
            React.createElement(Icon, { name: "x", size: 16 }))) : null));
}
const DOC_BADGE = {
    uploading: { tone: 'neutral', word: 'Загружается' },
    checking: { tone: 'info', word: 'Проверяем' },
    ok: { tone: 'success', word: 'Принят' },
    error: { tone: 'danger', word: 'Нужно заменить' },
};
function DocumentUpload({ label = 'Перетащите файлы сюда или выберите на компьютере', hint = 'PDF, JPG или PNG до 20 МБ', files = [], onFiles, onRemove, accept = '.pdf,.jpg,.jpeg,.png', multiple = true, className, }) {
    const [over, setOver] = React.useState(false);
    const inputId = React.useId();
    return (React.createElement("div", { className: cx('kk-upload', className) },
        React.createElement("label", { htmlFor: inputId, className: cx('kk-upload__zone', over && 'is-over'), onDragOver: (e) => { e.preventDefault(); setOver(true); }, onDragLeave: () => setOver(false), onDrop: (e) => { e.preventDefault(); setOver(false); if (onFiles && e.dataTransfer.files.length)
                onFiles(e.dataTransfer.files); } },
            React.createElement("span", { className: "kk-upload__icon" },
                React.createElement(Icon, { name: "upload", size: 24 })),
            React.createElement("span", { className: "kk-upload__label body-strong" }, label),
            hint ? React.createElement("span", { className: "kk-upload__hint body-sm" }, hint) : null,
            React.createElement("input", { id: inputId, type: "file", className: "kk-sr", accept: accept, multiple: multiple, onChange: (e) => { if (onFiles && e.target.files && e.target.files.length)
                    onFiles(e.target.files); } })),
        files.length ? (React.createElement("ul", { className: "kk-upload__list" }, files.map((f, i) => (React.createElement("li", { key: i, className: cx('kk-doc', 'is-' + f.status) },
            React.createElement("span", { className: "kk-doc__icon" },
                React.createElement(Icon, { name: "document", size: 20 })),
            React.createElement("div", { className: "kk-doc__main" },
                React.createElement("div", { className: "kk-doc__row" },
                    React.createElement("span", { className: "kk-doc__name body" }, f.name),
                    React.createElement(Badge, { tone: DOC_BADGE[f.status].tone, icon: f.status === 'uploading' ? false : undefined }, f.status === 'uploading' && f.progress != null ? DOC_BADGE.uploading.word + ' ' + f.progress + '%' : DOC_BADGE[f.status].word)),
                f.status === 'uploading' ? (React.createElement("span", { className: "kk-doc__bar", role: "progressbar", "aria-label": 'Загрузка ' + f.name, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": f.progress || 0 },
                    React.createElement("span", { style: { width: (f.progress || 0) + '%' } }))) : null,
                f.message ? React.createElement("p", { className: "kk-doc__msg body-sm" }, f.message) : f.size ? React.createElement("p", { className: "kk-doc__meta body-sm kk-num" }, f.size) : null),
            onRemove ? (React.createElement("button", { type: "button", className: "kk-iconbtn", onClick: () => onRemove(i), "aria-label": 'Удалить ' + f.name },
                React.createElement(Icon, { name: "x", size: 16 }))) : null))))) : null));
}

window.Cabinet = Object.assign(window.Cabinet || {}, exports);
})();

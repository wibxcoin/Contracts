/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

declare type BigNumber = number | string;

/**
 * Recognized contract namespaces
 */
const namespaces: Record<string, string> = {
    common: 'org.wiboo.wibxp.common',
    financial: 'org.wiboo.wibxp.financial'
};

/**
 * Financial entities
 */
const entities: Record<string, string> = {
    wallet: `${namespaces.common}.Wallet`,
    transfer: 'Transfer',
    deposit: 'Deposit',
    withdraw: 'Withdraw'
};

/**
 * big.js v5.2.2
 * A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
 * Copyright (c) 2018 Michael Mclaughlin <M8ch88l@gmail.com>
 *
 * https://github.com/MikeMcl/big.js/blob/master/LICENCE
 * @utility
 */
const __BigJS = (function()
{
    /************************************** EDITABLE DEFAULTS *****************************************/
    const
        // The default values below must be integers within the stated ranges.

        /*
        * The maximum number of decimal places (DP) of the results of operations involving division:
        * div and sqrt, and pow with negative exponents.
        */
        DP = 20, // 0 to MAX_DP

        /*
         * The rounding mode (RM) used when rounding to the above decimal places.
         *
         *  0  Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
         *  1  To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
         *  2  To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
         *  3  Away from zero.                                  (ROUND_UP)
         */
        RM = 1, // 0, 1, 2 or 3

        // The maximum value of DP and Big.DP.
        MAX_DP = 1E6, // 0 to 1000000

        /*
         * The negative exponent (NE) at and beneath which toString returns exponential notation.
         * (JavaScript numbers: -7)
         * -1000000 is the minimum recommended exponent value of a Big.
         */
        NE = -7, // 0 to -1000000

        /*
         * The positive exponent (PE) at and above which toString returns exponential notation.
         * (JavaScript numbers: 21)
         * 1000000 is the maximum recommended exponent value of a Big.
         * (This limit is not enforced or checked.)
         */
        PE = 21, // 0 to 1000000

        // Error messages.
        NAME = '[big.js] ',
        INVALID = NAME + 'Invalid ',
        INVALID_DP = INVALID + 'decimal places',
        INVALID_RM = INVALID + 'rounding mode',

        // The shared prototype object.
        P = {},
        UNDEFINED = void 0,
        NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;

    /*
     * Create and return a Big constructor.
     */
    function _Big_()
    {
        /*
         * The Big constructor and exported function.
         * Create and return a new instance of a Big number object.
         *
         * n {number|string|Big} A numeric value.
         */
        function Big(n)
        {
            const x = this;

            // Enable constructor usage without new.
            if (!(x instanceof Big)) return n === UNDEFINED ? _Big_() : new(Big as any)(n);

            // Duplicate.
            if (n instanceof Big)
            {
                x['s'] = n['s'];
                x['e'] = n['e'];
                x['c'] = n['c'].slice();
            }
            else
            {
                parse(x, n);
            }

            /*
             * Retain a reference to this Big constructor, and shadow Big.prototype.constructor which
             * points to Object.
             */
            x.constructor = Big;
        }

        Big.prototype = P;
        Big.DP = DP;
        Big.RM = RM;
        Big.NE = NE;
        Big.PE = PE;
        Big.version = '5.2.2';

        return Big;
    }

    /*
     * Parse the number or string value passed to a Big constructor.
     *
     * x {Big} A Big number instance.
     * n {number|string} A numeric value.
     */
    function parse(x, n)
    {
        let e, i, nl;

        // Minus zero?
        if (n === 0 && 1 / n < 0) n = '-0';
        else if (!NUMERIC.test(n += '')) throw Error(INVALID + 'number');

        // Determine sign.
        x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

        // Decimal point?
        if ((e = n.indexOf('.')) > -1) n = n.replace('.', '');

        // Exponential form?
        if ((i = n.search(/e/i)) > 0)
        {
            // Determine exponent.
            if (e < 0) e = i;
            e += +n.slice(i + 1);
            n = n.substring(0, i);
        }
        else if (e < 0)
        {

            // Integer.
            e = n.length;
        }

        nl = n.length;

        // Determine leading zeros.
        for (i = 0; i < nl && n.charAt(i) == '0';) ++i;

        if (i == nl)
        {

            // Zero.
            x.c = [x.e = 0];
        }
        else
        {

            // Determine trailing zeros.
            for (; nl > 0 && n.charAt(--nl) == '0';);
            x.e = e - i - 1;
            x.c = [];

            // Convert string to array of digits without leading/trailing zeros.
            for (e = 0; i <= nl;) x.c[e++] = +n.charAt(i++);
        }

        return x;
    }

    /*
     * Return a string representing the value of Big x in normal or exponential notation.
     * Handles P.toExponential, P.toFixed, P.toJSON, P.toPrecision, P.toString and P.valueOf.
     *
     * x {Big}
     * id? {number} Caller id.
     *         1 toExponential
     *         2 toFixed
     *         3 toPrecision
     *         4 valueOf
     * n? {number|undefined} Caller's argument.
     * k? {number|undefined}
     */
    function stringify(x, id ? , n ? , k?)
    {
        let e, s,
            Big = x.constructor,
            z = !x.c[0];

        if (n !== UNDEFINED)
        {
            if (n !== ~~n || n < (id == 3) || n > MAX_DP)
            {
                throw Error(id == 3 ? INVALID + 'precision' : INVALID_DP);
            }

            x = new Big(x);

            // The index of the digit that may be rounded up.
            n = k - x.e;

            // Round?
            if (x.c.length > ++k) round(x, n, Big.RM);

            // toFixed: recalculate k as x.e may have changed if value rounded up.
            if (id == 2) k = x.e + n + 1;

            // Append zeros?
            for (; x.c.length < k;) x.c.push(0);
        }

        e = x.e;
        s = x.c.join('');
        n = s.length;

        // Exponential notation?
        if (id != 2 && (id == 1 || id == 3 && k <= e || e <= Big.NE || e >= Big.PE))
        {
            s = s.charAt(0) + (n > 1 ? '.' + s.slice(1) : '') + (e < 0 ? 'e' : 'e+') + e;

            // Normal notation.
        }
        else if (e < 0)
        {
            for (; ++e;) s = '0' + s;
            s = '0.' + s;
        }
        else if (e > 0)
        {
            if (++e > n)
                for (e -= n; e--;) s += '0';
            else if (e < n) s = s.slice(0, e) + '.' + s.slice(e);
        }
        else if (n > 1)
        {
            s = s.charAt(0) + '.' + s.slice(1);
        }

        return x.s < 0 && (!z || id == 4) ? '-' + s : s;
    }

    // Prototype/instance methods

    /*
     * Round Big x to a maximum of dp decimal places using rounding mode rm.
     * Called by stringify, P.div, P.round and P.sqrt.
     *
     * x {Big} The Big to round.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
     * [more] {boolean} Whether the result of division was truncated.
     */
    function round(x, dp, rm, more?)
    {
        let xc = x.c,
            i = x.e + dp + 1;

        if (i < xc.length)
        {
            if (rm === 1)
            {
                // xc[i] is the digit after the digit that may be rounded up.
                more = xc[i] >= 5;
            }
            else if (rm === 2)
            {
                more = xc[i] > 5 || xc[i] == 5 &&
                    (more || i < 0 || xc[i + 1] !== UNDEFINED || xc[i - 1] & 1);
            }
            else if (rm === 3)
            {
                more = more || !!xc[0];
            }
            else
            {
                more = false;
                if (rm !== 0) throw Error(INVALID_RM);
            }

            if (i < 1)
            {
                xc.length = 1;

                if (more)
                {

                    // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                    x.e = -dp;
                    xc[0] = 1;
                }
                else
                {

                    // Zero.
                    xc[0] = x.e = 0;
                }
            }
            else
            {

                // Remove any digits after the required decimal places.
                xc.length = i--;

                // Round up?
                if (more)
                {

                    // Rounding up may mean the previous digit has to be rounded up.
                    for (; ++xc[i] > 9;)
                    {
                        xc[i] = 0;
                        if (!i--)
                        {
                            ++x.e;
                            xc.unshift(1);
                        }
                    }
                }

                // Remove trailing zeros.
                for (i = xc.length; !xc[--i];) xc.pop();
            }
        }
        else if (rm < 0 || rm > 3 || rm !== ~~rm)
        {
            throw Error(INVALID_RM);
        }

        return x;
    }

    /*
     * Return 1 if the value of this Big is greater than the value of Big y,
     *       -1 if the value of this Big is less than the value of Big y, or
     *        0 if they have the same value.
     */
    P['cmp'] = function(y)
    {
        let isneg,
            x = this,
            xc = x.c,
            yc = (y = new x.constructor(y)).c,
            i = x.s,
            j = y.s,
            k = x.e,
            l = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) return !xc[0] ? !yc[0] ? 0 : -j : i;

        // Signs differ?
        if (i != j) return i;

        isneg = i < 0;

        // Compare exponents.
        if (k != l) return (k > l as any) ^ isneg ? 1 : -1;

        j = (k = xc.length) < (l = yc.length) ? k : l;

        // Compare digit by digit.
        for (i = -1; ++i < j;)
        {
            if (xc[i] != yc[i]) return (xc[i] > yc[i] as any) ^ isneg ? 1 : -1;
        }

        // Compare lengths.
        return k == l ? 0 : (k > l as any) ^ isneg ? 1 : -1;
    };

    /*
     * Return true if the value of this Big is equal to the value of Big y, otherwise return false.
     */
    P['eq'] = function(y)
    {
        return !this.cmp(y);
    };

    /*
     * Return true if the value of this Big is greater than the value of Big y, otherwise return
     * false.
     */
    P['gt'] = function(y)
    {
        return this.cmp(y) > 0;
    };

    /*
     * Return true if the value of this Big is greater than or equal to the value of Big y, otherwise
     * return false.
     */
    P['gte'] = function(y)
    {
        return this.cmp(y) > -1;
    };

    /*
     * Return true if the value of this Big is less than the value of Big y, otherwise return false.
     */
    P['lt'] = function(y)
    {
        return this.cmp(y) < 0;
    };

    /*
     * Return true if the value of this Big is less than or equal to the value of Big y, otherwise
     * return false.
     */
    P['lte'] = function(y)
    {
        return this.cmp(y) < 1;
    };

    /*
     * Return a new Big whose value is the value of this Big minus the value of Big y.
     */
    P['minus'] = P['sub'] = function(y)
    {
        let i, j, t, xlty,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b)
        {
            y.s = -b;
            return x.plus(y);
        }

        let xc = x.c.slice(),
            xe = x.e,
            yc = y.c,
            ye = y.e;

        // Either zero?
        if (!xc[0] || !yc[0])
        {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
        }

        // Determine which is the bigger number. Prepend zeros to equalise exponents.
        if (a = xe - ye)
        {

            if (xlty = a < 0)
            {
                a = -a;
                t = xc;
            }
            else
            {
                ye = xe;
                t = yc;
            }

            t.reverse();
            for (b = a; b--;) t.push(0);
            t.reverse();
        }
        else
        {

            // Exponents equal. Check digit by digit.
            j = ((xlty = xc.length < yc.length) ? xc : yc).length;

            for (a = b = 0; b < j; b++)
            {
                if (xc[b] != yc[b])
                {
                    xlty = xc[b] < yc[b];
                    break;
                }
            }
        }

        // x < y? Point xc to the array of the bigger number.
        if (xlty)
        {
            t = xc;
            xc = yc;
            yc = t;
            y.s = -y.s;
        }

        /*
         * Append zeros to xc if shorter. No need to add zeros to yc if shorter as subtraction only
         * needs to start at yc.length.
         */
        if ((b = (j = yc.length) - (i = xc.length)) > 0)
            for (; b--;) xc[i++] = 0;

        // Subtract yc from xc.
        for (b = i; j > a;)
        {
            if (xc[--j] < yc[j])
            {
                for (i = j; i && !xc[--i];) xc[i] = 9;
                --xc[i];
                xc[j] += 10;
            }

            xc[j] -= yc[j];
        }

        // Remove trailing zeros.
        for (; xc[--b] === 0;) xc.pop();

        // Remove leading zeros and adjust exponent accordingly.
        for (; xc[0] === 0;)
        {
            xc.shift();
            --ye;
        }

        if (!xc[0])
        {

            // n - n = +0
            y.s = 1;

            // Result must be zero.
            xc = [ye = 0];
        }

        y.c = xc;
        y.e = ye;

        return y;
    };

    /*
     * Return a new Big whose value is the value of this Big plus the value of Big y.
     */
    P['plus'] = P['add'] = function(y)
    {
        let t,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b)
        {
            y.s = -b;
            return x.minus(y);
        }

        let xe = x.e,
            xc = x.c,
            ye = y.e,
            yc = y.c;

        // Either zero? y is non-zero? x is non-zero? Or both are zero.
        if (!xc[0] || !yc[0]) return yc[0] ? y : new Big(xc[0] ? x : a * 0);

        xc = xc.slice();

        // Prepend zeros to equalise exponents.
        // Note: reverse faster than unshifts.
        if (a = xe - ye)
        {
            if (a > 0)
            {
                ye = xe;
                t = yc;
            }
            else
            {
                a = -a;
                t = xc;
            }

            t.reverse();
            for (; a--;) t.push(0);
            t.reverse();
        }

        // Point xc to the longer array.
        if (xc.length - yc.length < 0)
        {
            t = yc;
            yc = xc;
            xc = t;
        }

        a = yc.length;

        // Only start adding at yc.length - 1 as the further digits of xc can be left as they are.
        for (b = 0; a; xc[a] %= 10) b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;

        // No need to check for zero, as +x + +y != 0 && -x + -y != 0

        if (b)
        {
            xc.unshift(b);
            ++ye;
        }

        // Remove trailing zeros.
        for (a = xc.length; xc[--a] === 0;) xc.pop();

        y.c = xc;
        y.e = ye;

        return y;
    };

    /*
     * Return a string representing the value of this Big in normal notation to dp fixed decimal
     * places and rounded using Big.RM.
     *
     * dp? {number} Integer, 0 to MAX_DP inclusive.
     *
     * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
     * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
     */
    P['toFixed'] = function(dp)
    {
        return stringify(this, 2, dp, this.e + dp);
    };

    // Export
    return function (n: BigNumber)
    {
        return _Big_()(n || 0);
    }
})();

/**
 * Check if the given amount is valid.
 *
 * @param {string | number | __BigJS} amount The amount
 * @utility
 */
function isAmountValid(amount: BigNumber): void
{
    const bigAmount = __BigJS(amount);

    assert(bigAmount.gte(0), 'Invalid amount! Should be <= 0');

    /**
     * Yes, we can do it with modulo, but to do it with big number, we need to put a lot
     * of code to calculate it (n % 1 === 0).
     * A string compare will be more efficient this time.
     */
    assert(!/\./.test(bigAmount.toFixed()), 'Floats are not permitted.');
}

/**
 * Safe Math Operations
 *
 * @utility
 */
class SafeMath
{
    /**
     * Add some number
     *
     * @param {BigNumber} a The first number
     * @param {BigNumber} b The second number
     * @utility
     */
    static add(a: BigNumber, b: BigNumber): string
    {
        const c: BigNumber = __BigJS(a).plus(__BigJS(b));
        assert(SafeMath.gte(c, a), 'Invalid add');

        return SafeMath.scientificToDec(c);
    }

    /**
     * Subtract some number
     *
     * @param {BigNumber} a The first number
     * @param {BigNumber} b The second number
     * @utility
     */
    static sub(a: BigNumber, b: BigNumber): string
    {
        assert(SafeMath.gte(a, b), 'Invalid subtraction');
        const c: BigNumber = __BigJS(a).minus(__BigJS(b));

        return SafeMath.scientificToDec(c);
    }

    /**
     * Get if the number is greater than or equal some other
     *
     * @param {BigNumber} a The first number
     * @param {BigNumber} b The second number
     * @utility
     */
    static gte(a: BigNumber, b: BigNumber): boolean
    {
        return __BigJS(a).gte(__BigJS(b));
    }

    /**
     * Convert some number in scientific to decimal
     *
     * @param {BigNumber} number The number to convert
     * @utility
     */
    static scientificToDec(number: BigNumber): string
    {
        return __BigJS(number).toFixed();
    }
}
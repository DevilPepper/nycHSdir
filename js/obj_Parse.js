﻿function parseWrapper(clase)
{
    function getFinds(oreo)
    {
        var oreos = [];
        $.each(oreo, function (i, milk) {
            oreos.push(milk.find().toJqueryPromise());
        });
        return oreos;
    }

    function orStuff(self)
    {
        var objection = true;
        var ors = [];
        for (var key in self.orables) {
            objection = false;
            var ored = Parse.Query.or.apply($, self.orables[key]);

            //limit, skip, ascending/descending, include need to be addedto the Ored query
            if (self.lim != null) ored.limit(self.lim);
            //for (var eq in self.eq) { ored.equalTo(eq, self.eq[eq]); }
            //for (var gt in self.gt) { ored.greaterThan(gt, self.gt[gt]); }
            //for (var lt in self.lt) { ored.lessThan(lt, self.lt[lt]); }
            for (var contained in self.contained) { ored.containedIn(contained, self.contained[contained]); }
            ors.push(ored);
        }
        if (objection) ors.push(self.query);
        return ors;
    }

    this.clase = Parse.Object.extend(clase);
    this.query = null;
    this.orables = {};
    this.lim = null;
    this.eq = {};
    this.gt = {};
    this.lt = {};
    this.contained = {};
    this.default = [];
    this.base = false;

    this.find = function () {
        if (!this.base) this.setBase();
        var orPromise = $.when.apply($, getFinds(orStuff(this)));
        var andPromise = $.Deferred();
        orPromise.then(
            function (andables)
            {
                if ($.isArray(andables[0])) {
                    while (andables[1]) {
                        $.each(andables.pop(), function (a, arr) {
                            andables.push($.grep(andables.pop(), function (and1) { return and1.attributes.dbn == arr.attributes.dbn; }));
                        });
                    }
                    andables = andables[0];
                }
                $.each(andables, function (this1, unnecessary) {
                    andables[this1] = andables[this1].attributes;
                });
                andPromise.resolve(andables);
            },
            andPromise.reject.bind(andPromise)
            );
        return andPromise.promise();
        //and finally and these results. Currently needs a helper function parseAND()
    }

    this.setBase = function ()
    {
        this.base = true;
        if (this.default.length > 0) { this.query = Parse.Query.or.apply($, this.default); }
        else { this.query = new Parse.Query(this.clase); }

        if (this.lim != null) this.query.limit(this.lim);
        for (var eq in this.eq) { this.query.equalTo(eq, this.eq[eq]); }
        for (var gt in this.gt) { this.query.greaterThan(gt, this.gt[gt]); }
        for (var lt in this.lt) { this.query.lessThan(lt, this.lt[lt]); }
        for (var contained in this.contained) { this.query.containedIn(contained, this.contained[contained]); }
        
    }
}

parseWrapper.prototype.equalTo = function (key, val, orProp) {
    if (typeof orProp === "string") {
        if (!this.base) this.setBase();
        if (!this.orables.hasOwnProperty(orProp)) this.orables[orProp] = [];
        this.orables[orProp].push(this.query.copy().equalTo(key, val));
    }
    else if (typeof orProp === "boolean") { this.default.push((new Parse.Query(this.clase)).lessThan(key, val)); }
    else {
        this.eq[key] = val;
    }
}

parseWrapper.prototype.greaterThan = function (key, val, orProp)
{
    if (typeof orProp === "string") {
        if (!this.base) this.setBase();
        if (!this.orables.hasOwnProperty(orProp)) this.orables[orProp] = [];
        this.orables[orProp].push(this.query.copy().greaterThan(key, val));
    }
    else if (typeof orProp === "boolean") { this.default.push((new Parse.Query(this.clase)).greaterThan(key, val)); }
    else {
        this.gt[key] = val;
    }
}

parseWrapper.prototype.lessThan = function (key, val, orProp)
{
    if (typeof orProp === "string") {
        if (!this.base) this.setBase();
        if (!this.orables.hasOwnProperty(orProp)) this.orables[orProp] = [];
        this.orables[orProp].push(this.query.copy().lessThan(key, val));
    }
    else if (typeof orProp === "boolean") { this.default.push((new Parse.Query(this.clase)).equalTo(key, val)); }
    else {
        this.lt[key] = val;
    }
}

parseWrapper.prototype.between = function (key, gtval, ltval, orProp) {
    if (!this.base) this.setBase();
    if (!this.orables.hasOwnProperty(orProp)) this.orables[orProp] = [];
    var bet = this.query.copy();
    if (gtval != null) bet.greaterThanOrEqualTo(key, gtval);
    if (ltval != null) bet.lessThan(key, ltval);
    this.orables[orProp].push(bet);
}

parseWrapper.prototype.limit = function (lim) { this.lim = lim; }

parseWrapper.prototype.containedIn = function (key, vals) { this.contained[key] = vals; }

parseWrapper.prototype.clearAll = function ()
{
    this.query = null;
    this.orables = {};
    this.lim = null;
    this.eq = {};
    this.gt = {};
    this.lt = {};
    this.contained = {};
    this.default = [];
    this.base = false;
}
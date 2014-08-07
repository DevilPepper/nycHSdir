function SODA(domain, id, appKey)
{
    //Private methods
    function queryString(key, vals, op) {
        var txt = "(";
        $.each(vals, function (i, val) {
            txt += key + op + "'" + val.replace("&", "%26") + "' OR ";
        });
        txt = txt.slice(0, -4);
        txt += ")";
        return txt;
    }

    function equalString(key, vals) { return queryString(key, vals, "="); }
    function gtString(key, vals) { return queryString(key, vals, ">"); }
    function ltString(key, vals) { return queryString(key, vals, "<"); }

    this.domain = domain;
    this.id = id;
    this.url = 'http://' + domain + '/resource/' + id + '.json?';
    this.appKey = '$$app_token=' + appKey;
    this.query = {};

    this.find = function () {
        var SODAlink = "";

        //$where
        var where = "";
        if (this.query.hasOwnProperty('eq')) {
            if (where.length == 0) where = "$where=";
            for (var key in this.query.eq) {
                where += equalString(key, this.query.eq[key]);
                where += " AND ";
            }
        }
        if (this.query.hasOwnProperty('gt')) {
            if (where.length == 0) where = "$where=";
            for (var key in this.query.gt) {
                where += gtString(key, this.query.gt[key]);
                where += " AND ";
            }
        }
        if (this.query.hasOwnProperty('lt')) {
            if (where.length == 0) where = "$where=";
            for (var key in this.query.lt) {
                where += ltString(key, this.query.lt[key]);
                where += " AND ";
            }
        }
        if (where.length>0) where = where.slice(0, -5);

        //$select
        var select = "";
        if (this.query.hasOwnProperty('select')) {
            select = "$select=";
            $.each(this.query.select, function (i, val) {
                select += val + ",";
            });
            select = select.slice(0, -1);
        }

        //$limit
        var limit = "";
        if (this.query.hasOwnProperty('limit')) {
            limit = "$limit=" + this.query.limit;
        }


        SODAlink += where;
        if (where.length > 0) SODAlink += "&";
        SODAlink += select;
        if (select.length > 0) SODAlink += "&";
        SODAlink += limit;
        if (limit.length > 0) SODAlink += "&";
        if (SODAlink.length < 0) SODAlink += "&";
        SODAlink = this.url + SODAlink;
        SODAlink += this.appKey;

        console.log(SODAlink);
        return $.getJSON(SODAlink);
    }
}

SODA.prototype.clearAll = function ()
{
    this.query = {};
}

SODA.prototype.equalTo = function (key, value)
{
    if (!this.query.hasOwnProperty('eq')) this.query['eq'] = {};
    if (!this.query.eq.hasOwnProperty(key)) this.query.eq[key] = [];
    this.query.eq[key].push(value);
}

SODA.prototype.greaterThan = function (key, value)
{
    if (!this.query.hasOwnProperty('gt')) this.query['gt'] = {};
    if (!this.query.gt.hasOwnProperty(key)) this.query.gt[key] = [];
    this.query.gt[key].push(value);
}

SODA.prototype.lessThan = function (key, value)
{
    if (!this.query.hasOwnProperty('lt')) this.query['lt'] = {};
    if (!this.query.lt.hasOwnProperty(key)) this.query.lt[key] = [];
    this.query.lt[key].push(value);
}

SODA.prototype.select = function (a)
{
    this.query['select'] = a;
}

SODA.prototype.limit = function (x)
{
    this.query['limit'] = x;
}

SODA.init = function (k) {
    return new sodaKey(k);
};

function sodaKey(appKey)
{
    this.appKey = appKey;
    this.extend = function (domain, id)
    {
        return new SODA(domain, id, this.appKey);
    };
}
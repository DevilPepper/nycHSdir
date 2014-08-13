Parse.Promise.prototype.toJqueryPromise = function () {
    var def = jQuery.Deferred();

    this.then(
      def.resolve.bind(def),
      def.reject.bind(def)
    );

    return def.promise();
}

Parse.Query.prototype.copy = function () {
    var clone = new Parse.Query(this.objectClass);

    clone._where = JSON.parse(JSON.stringify(this._where));
    clone._include = JSON.parse(JSON.stringify(this._include));
    clone._limit = this._limit; // negative limit means, do not send a limit
    clone._skip = this._skip;
    clone._extraOptions = JSON.parse(JSON.stringify(this._extraOptions));

    return clone;
}
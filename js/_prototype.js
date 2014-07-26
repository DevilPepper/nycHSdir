Parse.Promise.prototype.toJqueryPromise = function () {
    var def = jQuery.Deferred();

    this.then(
      def.resolve.bind(def),
      def.reject.bind(def)
    );

    return def.promise();
}
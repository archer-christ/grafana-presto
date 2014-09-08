define([
],
function () {
  'use strict';

  function PrestoQueryBuilder(target) {
    this.target = target;
  }

  var p = PrestoQueryBuilder.prototype;

  p.build = function() {
    return this.target.rawQuery ? this._modifyRawQuery() : this._buildQuery();
  };

  p._buildQuery = function() {
    var target = this.target;
    var query = 'select ';
    var seriesName = target.series;

    if(!seriesName.match('^/.*/')) {
      seriesName = '' + seriesName+ '';
    }

    if (target.groupby_field) {
      query += target.groupby_field + ', ';
    }

    query +=  '$datetrunc as time, ';

    query +=  target.function + '(' + target.column + ')';
    query += ' from ' + seriesName + ' where $timeFilter';

    if (target.condition) {
      query += ' and ' + target.condition;
    }

    query += ' group by $interval';

    if (target.groupby_field) {
      query += ', ' + target.groupby_field;
      this.groupByField = target.groupby_field;
    }

    if (target.fill) {
      query += ' fill(' + target.fill + ')';
    }

    //query += " order asc";
    target.query = query;

    return query;
  };

  p._modifyRawQuery = function () {
    var query = this.target.query.replace(";", "");

    var queryElements = query.split(" ");
    var lowerCaseQueryElements = query.toLowerCase().split(" ");

    if (lowerCaseQueryElements[1].indexOf(',') !== -1) {
      this.groupByField = lowerCaseQueryElements[1].replace(',', '');
    }

    return queryElements.join(" ");
  };

  return PrestoQueryBuilder;
});

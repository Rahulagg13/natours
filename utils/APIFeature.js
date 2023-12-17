class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    //1A.}Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // 1B.Advanced filtering
    //gte gt lte le
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    queryStr = JSON.parse(queryStr);
    this.query = this.query.find(queryStr);

    return this;
  }

  sort() {
    // 2) sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      //sort('price  ratingAverage')
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }
  limitField() {
    //3)limiting field
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // projection --> selecting certain field names
      this.query = this.query.select(fields);
      //sort('price  ratingAverage')
    } else {
      // - stands for remove field
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    //4) pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit;
    const skip = limit * (page - 1);
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;

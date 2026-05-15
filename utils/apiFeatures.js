class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // Mongoose query (Tour.find())
    this.queryString = queryString; // req.query or custom query
  }

  // 1) FILTERING
  filter() {
    // OLD WAY (inside controller) ❌
    /*
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, el => `$${el}`);

    let query = Tour.find(JSON.parse(queryStr));
    */

    // NEW WAY (inside class) ✅
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (el) => `$${el}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this; // 🔥 important for chaining
  }

  // 2) SORTING
  sort() {
    // OLD WAY ❌
    /*
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    */

    // NEW WAY ✅
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  // 3) FIELD LIMITING
  limitFields() {
    // OLD WAY ❌
    /*
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    */

    // NEW WAY ✅
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  // 4) PAGINATION
  paginate() {
    // OLD WAY ❌
    /*
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    */

    // NEW WAY ✅
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;

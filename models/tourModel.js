const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour must have a name'], //true, default msg
      unique: true,
      trim: true,
      maxlength: [40, 'A Name Must be Less Than 40 Words'],
      minlength: [10, 'A Tour Name Must Have More than 10 Words']
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      require: [true, 'A Tour must have a gorup size']
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have difficulty level'],
      enum: {
        //only accepts strings in the array below
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty must be easy medium or difficult'
      }
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating but be above 1'],
      max: [5, 'Rating but be below 5'],
      set: (val) => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'a tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to current doc on NEW document creation, if update/patch it wont work
          return val < this.price;
        },
        message: 'discount price ({VALUE}) not less than actual price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A Tour must hava a summary ']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'a tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    seceretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number], //take lng before lat abit weird
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//this is not part of database so cant use  like tour.find (duraiton week)
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// DOCUMENT MIDDLEWEAR: runs before .save() and .create(), only runs if those 2 are called
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//this code is guide for embedding
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('will save document');
//   next();
// });

// //post has access not just next but also doc that was just saved
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWEAR (/^find/all that starts why find will trigger this middle wear )
tourSchema.pre(/^find/, function (next) {
  this.where({ seceretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

// //AGGRREGATION MIDDLEWARE (this here filteres the aggregation)
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: { seceretTour: { $ne: true } },
//   });
//   next();
// });

tourSchema.post(/^find/, function (docs, next) {
  console.log(`query took ${Date.now() - this.start}`);
  next();
});
const Tour = mongoose.model('Tour', tourSchema); //now tour holds the scheme

module.exports = Tour;

import chai from 'chai';

chai.should();

export default function compareVectors(vector1, vector2, epsilon) {
  if (!epsilon) {
    vector1.x.should.equal(vector2.x);
    vector1.y.should.equal(vector2.y);
    vector1.z.should.equal(vector2.z);
  } else {
    vector1.x.should.be.closeTo(vector2.x, epsilon);
    vector1.y.should.be.closeTo(vector2.y, epsilon);
    vector1.z.should.be.closeTo(vector2.z, epsilon);
  }
}

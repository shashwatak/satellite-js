import chai from 'chai';

chai.should();

export default function compareVectors(vector1, vector2, delta) {
  if (!delta) {
    vector1.x.should.equal(vector2.x);
    vector1.y.should.equal(vector2.y);
    vector1.z.should.equal(vector2.z);
  } else {
    vector1.x.should.be.closeTo(vector2.x, delta);
    vector1.y.should.be.closeTo(vector2.y, delta);
    vector1.z.should.be.closeTo(vector2.z, delta);
  }
}

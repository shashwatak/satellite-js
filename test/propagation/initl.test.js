import initl from '../../src/propagation/initl'; // eslint-disable-line

describe('Propagator Initialization', () => {
  it('Legacy Sidereal Time Calculations', () => {
    const options = {
      ecco: 0.1846988,
      epoch: 25938.538312919904,
      inclo: 0,
      method: 'n',
      no: 0.0037028783237264057,
      opsmode: 'a',
      satn: '00001',
    };
    const results = initl(options);
    expect(results.ainv).toEqual(0.1353414893496189);
    expect(results.ao).toEqual(7.3887172721793);
    expect(results.con41).toEqual(2);
    expect(results.con42).toEqual(-4);
    expect(results.cosio).toEqual(1);
    expect(results.cosio2).toEqual(1);
    expect(results.eccsq).toEqual(0.034113646721439995);
    expect(results.gsto).toEqual(5.220883431398299);
    expect(results.method).toEqual('n');
    expect(results.no).toEqual(0.003702762286531528);
    expect(results.omeosq).toEqual(0.96588635327856);
    expect(results.posq).toEqual(50.931932818552305);
    expect(results.rp).toEqual(6.02403005846851);
    expect(results.rteosq).toEqual(0.9827951736137902);
    expect(results.sinio).toEqual(0);
  });
});

import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'SGP4/SDP4 Propagation from TLE and OMM',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Satellite.js is a TypeScript library that provides modular, tree-shakeable functions
        for SGP4/SDP4 orbit propagation. It can parse TLE and OMM formats from sources like
        Celestrak and Space-Track.
      </>
    ),
  },
  {
    title: 'Propagate thousands of satellites in milliseconds',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Propagating the entire catalog is computationally expensive. Satellite.js
        provides an optional WebAssembly module compiled from optimized C++ for maximum
        theoretical performance.
      </>
    ),
  },
    {
    title: 'Coordinate transforms and other utilities',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Satellite.js also provides functions for coordinate transforms: ECF, Geodetic,
        Look Angles. It also has essentials like Doppler factor calculation, Earth umbra/penumbra
        determination, and more.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

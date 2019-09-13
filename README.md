# ARGO-TRADING PLUGIN DC

[![NPM version](https://badge.fury.io/js/argo-trading-plugin-dc.svg)](http://badge.fury.io/js/argo-trading-plugin-dc)
[![Build Status](https://travis-ci.org/albertosantini/argo-trading-plugin-dc.svg)](https://travis-ci.org/albertosantini/argo-trading-plugin-dc)
![](https://github.com/albertosantini/argo-trading-plugin-dc/workflows/CI/badge.svg)

`argo-tradin-plugin-dc` is a plugin for [Argo][], the open source trading
platform, connecting directly with [OANDA][] through the powerful [API][].

For demo purpose only it implements a strategy (`lib/custom/ontick.js`) based on
Directional-Change (see References section below).

## Getting Started

```
npm install -g argo-trading-plugin-dc
```

After starting Argo and logging in, the plugin can be started with the following
command:

```
argo-trading-plugin-dc
```

Don't forget to enable the plugin in `Plugins` tab of Argo.

## References

- [High Frequency Finance: Using Scaling Laws to Build Trading Models](https://www.olseninvest.com/customer/pdf/c20.pdf)
- [R&D Strategy Document](http://arxiv.org/abs/1405.6027)
- [A Directional-Change Event Approach for Studying Financial Time Series](http://www.economics-ejournal.org/economics/journalarticles/2012-36)
- [Patterns in high-frequency FX data: Discovery of 12 empirical scaling laws](http://arxiv.org/abs/0809.1040v2)
- [The hidden treasure of high frequency dynamics: from intrinsic time to scaling laws](https://fp7.portals.mbs.ac.uk/Portals/59/docs/OLSEN%20conferencemanchester091004.pdf)
- [Patterns in FTSE 100 Index: Reexamine directional change scaling laws](http://www.bracil.net/Guests/Yu.Zhang/Yu%20Zhang-Dissertation.pdf)
- [Directional Changes](http://www.bracil.net/finance/DirectionalChanges/)
- [Risk Management Tools based on Scaling Laws and Directional-Change Intrinsic Time](https://github.com/VladUZH/VlPetrov)
- [The Alpha Engine: Designing an Automated Trading Algorithm](https://github.com/AntonVonGolub/Code)

## Disclaimer

NOT INVESTMENT ADVICE AND WILL LOSE LOTS OF MONEY SO PROCEED WITH CAUTION.

[Argo]: https://github.com/albertosantini/argo
[OANDA]: http://fxtrade.oanda.co.uk/
[API]: http://developer.oanda.com/

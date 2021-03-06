<script>
import Loading from '@/components/Loading';
import { CATALOG } from '@/config/types';
import {
  REPO_TYPE, REPO, CHART, VERSION, STEP
} from '@/config/query-params';
import { CATALOG as CATALOG_ANNOTATIONS } from '@/config/labels-annotations';
import { ensureRegex } from '@/utils/string';
import { sortBy } from '@/utils/sort';
import ButtonGroup from '@/components/ButtonGroup';
import Checkbox from '@/components/form/Checkbox';
import LazyImage from '@/components/LazyImage';

export default {
  components: {
    Loading,
    ButtonGroup,
    Checkbox,
    LazyImage,

  },

  async fetch() {
    await this.$store.dispatch('catalog/load');
    this.allCharts = this.$store.getters['catalog/charts'];
  },

  data() {
    return {
      allCharts: null,

      searchQuery:    '',
      sortField:      'certifiedSort',
      showDeprecated: false,
      showRancher:    true,
      showPartner:    true,
      showOther:      true,
    };
  },

  computed: {
    filteredCharts() {
      return (this.allCharts || []).filter((c) => {
        if ( c.deprecated && !this.showDeprecated ) {
          return false;
        }

        if ( ( c.certified === CATALOG_ANNOTATIONS._RANCHER && !this.showRancher ) ||
             ( c.certified === CATALOG_ANNOTATIONS._PARTNER && !this.showPartner ) ||
             ( c.certified !== CATALOG_ANNOTATIONS._RANCHER && c.certified !== CATALOG_ANNOTATIONS._PARTNER && !this.showOther )
        ) {
          return false;
        }

        if ( this.searchQuery ) {
          const searchTokens = this.searchQuery.split(/\s*[, ]\s*/).map(x => ensureRegex(x, false));

          for ( const token of searchTokens ) {
            if ( !c.chartName.match(token) && !c.description.match(token) ) {
              return false;
            }
          }
        }

        return true;
      });
    },

    arrangedCharts() {
      return sortBy(this.filteredCharts, [this.sortField, 'chartName']);
    },
  },

  methods: {
    selectChart(chart) {
      this.$router.push({
        name:   'c-cluster-product-resource-create',
        params: {
          cluster:  this.$route.params.cluster,
          product:  this.$store.getters['productId'],
          resource: CATALOG.RELEASE,
        },
        query: {
          [REPO_TYPE]: chart.repoType,
          [REPO]:      chart.repoName,
          [CHART]:     chart.chartName,
          [VERSION]:   chart.versions[0].version,
          [STEP]:      2
        }
      });
    },

    focusSearch() {
      this.$refs.searchQuery.focus();
      this.$refs.searchQuery.select();
    }
  },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else-if="!allCharts.length" class="m-50 text-center">
    <h1>There are no charts available, have you added any repos?</h1>
  </div>
  <div v-else>
    <div class="clearfix">
      <div class="pull-left">
        <Checkbox v-model="showRancher" label="Rancher" class="check-rancher" />
        <Checkbox v-model="showPartner" label="Partner" class="check-partner" />
        <Checkbox v-model="showOther" label="Other" class="check-other" />
      </div>
      <div class="pull-right">
        <input ref="searchQuery" v-model="searchQuery" type="search" class="input-sm" placeholder="Filter">
        <button v-shortkey.once="['/']" class="hide" @shortkey="focusSearch()" />
      </div>
      <div class="pull-right pt-5 pr-10">
        <ButtonGroup v-model="sortField" :options="[{label: 'By Name', value: 'name'}, {label: 'By Kind', value: 'certifiedSort'}]" />
      </div>
    </div>
    <div class="charts">
      <div v-for="c in arrangedCharts" :key="c.key" class="chart" :class="{[c.certified]: true}" @click="selectChart(c)">
        <div class="side-label">
          <label v-if="c.sideLabel">{{ c.sideLabel }}</label>
        </div>
        <div class="logo">
          <LazyImage :src="c.icon" />
        </div>
        <h4 class="name">
          {{ c.chartName }}
        </h4>
        <div class="description">
          {{ c.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  $chart: 110px;
  $side: 15px;
  $margin: 10px;
  $logo: 60px;

  .check-rancher, .check-partner, .check-other {
    border-radius: var(--border-radius);
    padding: 3px 0 3px 8px;
    margin-right: 5px;
  }
  .check-rancher {
    background: var(--app-rancher-bg);
    border: 1px solid var(--app-rancher-accent);
  }
  .check-partner {
    background: var(--app-partner-bg);
    border: 1px solid var(--app-partner-accent);
  }
  .check-other {
    background: var(--app-other-bg);
    border: 1px solid var(--app-other-accent);
  }

  .charts {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin: 0 -1*$margin;

    @media only screen and (min-width: map-get($breakpoints, '--viewport-4')) {
      .chart {
        width: 100%;
      }
    }
    @media only screen and (min-width: map-get($breakpoints, '--viewport-7')) {
      .chart {
        width: calc(50% - 2 * #{$margin});
      }
    }
    @media only screen and (min-width: map-get($breakpoints, '--viewport-9')) {
      .chart {
        width: calc(33.33333% - 2 * #{$margin});
      }
    }
    @media only screen and (min-width: map-get($breakpoints, '--viewport-12')) {
      .chart {
        width: calc(25% - 2 * #{$margin});
      }
    }

    .chart {
      height: $chart;
      margin: $margin;
      padding: $margin;
      position: relative;
      border-radius: calc( 3 * var(--border-radius));

      &:hover {
        box-shadow: 0 0 0 2px var(--body-text);
        transition: box-shadow 0.1s ease-in-out;
        cursor: pointer;
      }

      .side-label {
        transform: rotate(180deg);
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        min-width: calc(3 * var(--border-radius));
        width: $side;
        border-top-right-radius: calc( 3 * var(--border-radius));
        border-bottom-right-radius: calc( 3 * var(--border-radius));

        label {
          text-align: center;
          writing-mode: tb;
          height: 100%;
          padding: 0 1px;
          display: block;
          white-space: no-wrap;
          text-overflow: ellipsis;
        }
      }

      .logo {
        text-align: center;
        position: absolute;
        left: $side+$margin;
        top: ($chart - $logo)/2;
        width: $logo;
        height: $logo;
        border-radius: calc(5 * var(--border-radius));
        overflow: hidden;
        background-color: white;

        img {
          width: $logo - 4px;
          height: $logo - 4px;
          object-fit: contain;
          position: relative;
          top: 2px;
        }
      }

      &.rancher {
        background: var(--app-rancher-bg);
        .side-label {
          background-color: var(--app-rancher-accent);
          color: var(--app-rancher-accent-text);
        }
      }

      &.partner {
        background: var(--app-partner-bg);
        .side-label {
          background-color: var(--app-partner-accent);
          color: var(--app-partner-accent-text);
        }
      }

      &.other {
        background: var(--app-other-bg);
        .side-label {
          background-color: var(--app-other-accent);
          color: var(--app-other-accent-text);
        }
      }

      .name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: $margin;
        margin-left: $side+$logo+$margin;
      }

      .description {
        margin-top: $margin;
        margin-left: $side+$logo+$margin;
        margin-right: $margin;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--text-muted);
      }
    }
  }

</style>

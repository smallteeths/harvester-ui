import _ from 'lodash';
import { VM } from '@/config/types';

export default {
  availableActions() {
    const out = this._standardActions;

    return [
      {
        action:     'createFromImage',
        enabled:    true,
        icon:       'icon icon-fw icon-spinner',
        label:      'Create a virtual Machine',
      },
      ...out
    ];
  },

  createFromImage() {
    return () => {
      const router = this.currentRouter();

      router.push({
        name:   `c-cluster-product-resource-create`,
        params: { resource: VM },
        query:  { image: this.spec.displayName }
      });
    };
  },

  isReady() {
    return this?.status?.conditions?.[0].status === 'True';
  },

  stateDisplay() {
    const status = this.getStatusConditionOfType('imported')?.status;

    if (status === undefined) {
      return 'Unknown';
    }

    return status === 'True' ? 'Imported' : status === 'Unknown' ? 'Progress' : 'Failed';
  },

  stateBackground() {
    return this.stateColor(this.stateDisplay).replace('text-', 'bg-');
  },
};

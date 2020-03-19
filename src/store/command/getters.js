export const GET_DATA_ARRAY = 'getDataArray';
export const GET_STDERR_ARRAY = 'getStderrArray';

export default {
  [GET_DATA_ARRAY](state) {
    if (state.data) {
      return state.data.split(/\r*\n/);
    }
    return '';
  },
  [GET_STDERR_ARRAY](state) {
    if (state.stdError) {
      return state.stdError.replace(/\r*\n/g, '<br />');
    }
    return '';
  },
};

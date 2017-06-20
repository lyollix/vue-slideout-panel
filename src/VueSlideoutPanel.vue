<template>
  <div>
    <transition name="fade">
      <div v-if="isVisibleDock" class="blackout" @click="closeAll"></div>
    </transition>
    <transition name="slide-out" v-on:enter="d_enter">
      <div v-if="isVisibleDock"
           ref="dock"
           class="dock"
           :style="_style(0)"
           :class="_class(0)">
           <transition-group name="slide-out"
                             v-on:before-leave="s_beforeLeave"
                             v-on:afterLeave="s_afterLeave">
           <section
               v-for="(isVisible, i) in isVisibleSections"
               v-if="isVisible"
               ref="section"
               class="panel"
               :key="'k'+i"
               :style="_style(i+1)"
               :class="_class(i+1)">

               <div v-if="i == 0"><slot></slot></div>
               <div v-else><slot name="extra"></slot></div>

               <a href="#"
                  class="action-close"
                  :style="_style(3)"
                  :class="_class(3)"
                  @click.prevent="close(i)"
                  v-html="closeHtml">
               </a>
               <a v-if="count==2 && !isShifted && i==0"
                  href="#"
                  class="action-extra"
                  :style="_style(4)"
                  :class="_class(4)"
                  @click.prevent="closeAll"
                  v-html="closeAllHtml">
               </a>
               <a v-if="isShifted && i==0"
                  href="#"
                  class="action-extra"
                  :style="_style(4)"
                  :class="_class(4)"
                  @click.prevent="expand"
                  v-html="extraHtml">
               </a>
           </section>
         </transition-group>
      </div>
    </transition>
  </div>
</template>

<script>

let easeOutCubic   = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
let easeOutSine    = 'cubic-bezier(0.39, 0.575, 0.565, 1)';
let bz_func = easeOutCubic;

export default {

  name: 'VueSideoutPanel',

  props: {
    value: {
      type: Boolean,
      default: false,
      required: true
    },
    count: {
      type: Number,
      default: 1,
      validator(v) {
        return v > 0 && v <= 2;
      }
    },
    showExtra: {
      type: Boolean,
      default: false
    },
    closeHtml: {
      type: String,
      default: "Close"
    },
    closeAllHtml: {
      type: String,
      default: "Close all"
    },
    extraHtml: {
      type: String,
      default: "Extra show"
    },
    widths: {
      type: Array,
      default() {
        if (this.count == 1) return ["100%"];
        else return ["100%","50%"];
      },
      validator(v) {
        return v.reduce((a, b) =>
            a && (/col-(\w+-)?\d+|\d+px|\d+%/.test(b)), true);
      }
    },
    classes: {
      type: Array,
      default() {
        return new Array(5).fill('default');
      },
      validator(v) {
        return v.reduce((a, b) => a && (!b || typeof(b) == 'string'), true);
      }
    },
    styles: {
      type: Array,
      default() {
        return [{},{},{},{},{}];
      },
      validator(v) {
        return v.reduce((a, b) => a && (!b || typeof(b) == 'object'), true);
      }
    },
  },

  data() {
    return {
      isVisibleDock: this.value,
      isVisibleSections: [],
      isShifted: false,
      d_styles:[],
      d_classes:[]
    }
  },

  created() {
    this.init();
  },

  watch: {
    value() {
      this.isVisibleDock = this.value;
    }
  },

  computed: {
    isVisibleCloseAll() {
      return this.count==2 && !this.isShifted;
    },
  },

  methods: {
    init() {
      this.isShifted = false;

      this.d_styles  = []
      this.d_classes = [];

      for(let i=0;i<5;i++) {
        if(this.classes[i] && this.classes[i].length>=0) {
          i==2 && this.classes[i]=='same' ?
              this.d_classes.push(this.classes[i-1])
            : this.d_classes.push(this.classes[i]);
        }
        else {
          this.d_classes.push('default');
        }
      }
      if (this.count == 2) {
        this.d_classes[1]+=' vsp-br';
        this.d_classes[2]+=' vsp-bl';
      }
      for(let i=0;i<5;i++) {
        i==2 && this.styles[i] && this.styles[i].same ?
            this.d_styles.push(Object.assign({}, this.styles[i-1] || {}))
          : this.d_styles.push(this.styles[i] || {})
      }

      let isSecondSet = false;
      if (this.count == 1) {
        this.widths[0] = this.widths[0] || this.widths[1];
        this.widths[1] = '100%';
      } else if (/\d+%/.test(this.widths[1])) {
        this.d_styles[2].width = `${100 - this.widths[1].slice(0,-1)}%`;
        isSecondSet = true;
      }
      this.widths.forEach( (_w, i) => {
        if (/col-(\w+-)?\d+/.test(_w)) {
          this.d_classes[i] += ' '+_w;
        } else {
          if (i==2 && isSecondSet) return;
          this.d_styles[i].width = _w;
        }
      });

      this.isVisibleSections = new Array(this.count).fill(1);

    },

    _style(index) {
      return this.d_styles[index];
    },

    _class(index) {
      return this.d_classes[index];
    },

    setTransform(el,v) {
      ['webkitTransform','MozTransform','msTransform','OTransform','transform'].forEach((t)=>{
        el.style[t] = v[0];
      });
      el.style.transitionTimingFunction=v[1];
      el.style.transitionDuration = v[2];
    },

    d_shift() {
      let cx = -this.$refs.section[1].offsetWidth;
      this.setTransform(this.$refs.dock,['right',bz_func,'.8s']);
      this.$refs.dock.style.right = `${cx}px`;
      this.isShifted = true;
    },

    s_beforeLeave() {
     if (this.isVisibleSections[1]) {
        this.$refs.dock.style.boxShadow = 'none';
        this.$refs.section[1].style.boxShadow = '-3px 3px 9px rgba(0, 0, 0, 0.3)';
      } else {
        this.d_shift();
      }
    },

    s_afterLeave() {
      if (this.isVisibleSections[1]) {
        this.$refs.dock.style.boxShadow = '-3px 3px 9px rgba(0, 0, 0, 0.3)';
        this.$refs.dock.style.width = this.$refs.section[0].offsetWidth+'px';;
        this.$refs.section[0].style.width = '100%';
      }
    },

    d_enter() {
      this.count==2 && !this.showExtra && this.d_shift();
    },

    expand() {
      this.setTransform(this.$refs.dock,['right',bz_func,'.8s']);
      setTimeout(()=>{
        this.setTransform(this.$refs.dock, ['','','']);
      }, 800);
      this.$refs.dock.style.right = '0';
      this.isShifted = false;
    },

    closeDock() {
      this.isVisibleDock = false;
      this.init();
      this.$emit('close');
    },

    close(index) {
      if (this.count==1) {
        this.closeDock();
      } else if (this.isShifted) {
        this.setTransform(this.$refs.dock,['right',easeOutSine,'1.2s']);
        this.closeDock();
      } else if (index==0) {
        this.$set(this.isVisibleSections,0,0);
      } else if (index==1 && this.isVisibleSections[0]) {
        this.d_shift();
      } else {
        this.closeDock();
      }
    },

    closeAll() {
      if(this.isShifted) {
        this.setTransform(this.$refs.dock,['right',easeOutSine,'1.2ss']);
      }
      this.closeDock();
    }
  }
}
</script>


<style scoped>
  .blackout {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2000;
    background-color: rgba(0, 0, 0, .3);
  }
  .dock {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    z-index: 3000;
    box-shadow: -3px 3px 9px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }
  section {
    position: relative;
    display: inline-block;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }
  .panel > div {
    height: 100%;
    overflow: auto;
  }
  .panel.default {
    background-color: #fff;
    padding: 1rem 1rem 3rem;
  }
  .action-close.default {
    position: absolute;
    bottom: 1rem;
    cursor: pointer;
  }
  .action-extra.default {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    cursor: pointer;
  }
  .vsp-br{
    border-right: 2px solid rgba(0, 0, 0, .2);
  }
  .vsp-bl{
    border-left: 2px solid rgba(0, 0, 0, .1);
  }
  .slide-out-enter-active, .slide-out-leave-active {
    transition: transform .8s cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  .slide-out-enter, .slide-out-leave-to {
    transform: translateX(100%);
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .8s ease-in;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0
  }
  .bg-transparent {
    background-color: transparent !important;
  }
</style>

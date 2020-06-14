<template>
    <v-menu
        :close-on-content-click="false"
        :content-class="contentClass"
        :nudge-bottom="nudgeBottom"
        :nudge-left="nudgeLeft"
        :nudge-right="nudgeRight"
        :nudge-top="nudgeTop"
        :position-x="position.x || 0"
        :position-y="position.y || 0"
        absolute
        eager
        ref="popoverMenu"
        v-model="showPopover"
    >
        <div class="custom-popover--container" ref="popoverMenuContent">
            <div :class="[arrowDirection]" :style="arrowStyle" class="arrow"></div>
            <div
                @mouseenter="onMouseEnter"
                @mouseleave="onMouseLeave"
                class="custom-popover--content elevation-8"
            >
                <slot></slot>
            </div>
        </div>
    </v-menu>
</template>
<script>
// Menu padding
const MENU_OFFSET = 16;
const ARROW_OFFSET = 8;
// Set by VMenu of Vuetify
const MENU_END_GUARD = 12;
const OFFSET_STEP = 5;
const ALIGNMENTS = {
    start: 0.25,
    center: 0.5,
    end: 0.75,
};

// Direction the menu should take when it cannot be placed in the current direction
const DIRECTIONS = {
    right: ["right", "left", "top", "bottom"],
    left: ["left", "right", "top", "bottom"],
    top: ["top", "bottom", "right", "left"],
    bottom: ["bottom", "top", "right", "left"],
};

function getOffsetValue(val, offset) {
    let value = val - offset;
    return value > 0 ? value : val;
}

function getOffset(content, position, remaining, offset) {
    // Boundary condition
    if (offset + MENU_OFFSET < 0.1 * content || offset + MENU_OFFSET > 0.9 * content) {
        return 0;
    }

    if (Math.abs(position - offset) < OFFSET_STEP) {
        return offset;
    }

    if (position > offset) {
        if (Math.abs(remaining - (content - offset)) < OFFSET_STEP) {
            return offset;
        }
        if (remaining > content - offset) {
            return offset;
        } else {
            return getOffset(content, position, remaining, offset + OFFSET_STEP);
        }
    } else {
        return getOffset(content, position, remaining, offset - OFFSET_STEP);
    }
}

export default {
    name: "CustomPopover",
    inheritAttrs: false,
    data() {
        return {
            hasWindow: true,
            showPopover: false,
            arrowStyle: {},
            nudgeTop: 0,
            nudgeBottom: 0,
            nudgeLeft: 0,
            nudgeRight: 0,
            openTimeout: null,
            closeTimeout: null,
            arrowDirection: "left",
        };
    },
    props: {
        // v-model
        value: {
            type: Boolean,
        },

        position: {
            type: Object,
            required: true,
            default: () => ({
                x: 0,
                y: 0,
                offset: 0,
            }),
        },

        closeDelay: {
            type: [Number, String],
            default: 100,
        },

        openDelay: {
            type: [Number, String],
            default: 0,
        },

        left: {
            type: Boolean,
            default: false,
        },

        right: {
            type: Boolean,
            default: true,
        },

        top: {
            type: Boolean,
            default: false,
        },

        bottom: {
            type: Boolean,
            default: false,
        },

        start: {
            type: Boolean,
            default: false,
        },

        end: {
            type: Boolean,
            default: false,
        },

        closeOnContentHover: {
            type: Boolean,
            default: false,
        },
    },

    computed: {
        contentClass() {
            return `elevation-0 ${
                this.$attrs?.contentClass ?? this.$attrs?.["content-class"] ?? ""
            }`;
        },
    },

    watch: {
        value(val) {
            this.runDelay(val ? "open" : "close");
        },

        showPopover(val) {
            this.$emit("input", val);
        },

        position(val) {
            // This method opens and closes the menu content so that we get its dimensions
            this.$refs.popoverMenu.sneakPeek(this.updateDimensions.bind(this, val));
        },
    },

    beforeDestroy() {
        this.clearDelay();
    },

    beforeMount() {
        this.hasWindow = typeof window !== "undefined";
    },

    methods: {
        onMouseEnter() {
            if (this.closeOnContentHover) return;
            this.runDelay("open");
        },

        onMouseLeave() {
            if (this.closeOnContentHover) return;
            this.runDelay("close");
        },

        updateDimensions(position) {
            let content = this.getContentDimensions();
            let screen = this.getDocumentDimensions(position);
            let placement = this.getDirection();
            let alignment = this.getAlignment();

            let placed = false;
            for (const direction of DIRECTIONS[placement]) {
                placed = this.placeMenu(position, content, screen, direction, alignment);
                if (placed) break;
            }

            if (!placed) {
                this.nudgeLeft = 0;
                this.nudgeRight = 0;
                this.nudgeTop = 0;
                this.nudgeBottom = 0;
                this.setArrowStyle(false);
            }
        },

        placeMenu(position, content, screen, direction, align) {
            if (direction === "top" && position.y > content.height + position.offset) {
                let offset = Math.round(ALIGNMENTS[align] * content.width);
                offset = getOffset(content.width, position.x, screen.remainingWidth, offset);

                this.setArrowStyle(
                    !!offset,
                    "bottom",
                    getOffsetValue(content.height, MENU_OFFSET),
                    getOffsetValue(offset, ARROW_OFFSET)
                );

                this.nudgeLeft = offset;
                this.nudgeRight = 0;
                this.nudgeTop = content.height + this.position.offset;
                this.nudgeBottom = 0;

                return true;
            }

            if (
                direction === "bottom" &&
                screen.remainingHeight > content.height + position.offset
            ) {
                let offset = Math.round(ALIGNMENTS[align] * content.width);
                offset = getOffset(content.width, position.x, screen.remainingWidth, offset);

                this.setArrowStyle(
                    !!offset,
                    "top",
                    ARROW_OFFSET,
                    getOffsetValue(offset, ARROW_OFFSET)
                );

                this.nudgeLeft = offset;
                this.nudgeRight = 0;
                this.nudgeBottom = this.position.offset;
                this.nudgeTop = 0;

                return true;
            }

            if (direction === "left" && this.position.x > content.width + position.offset) {
                let offset = Math.round(ALIGNMENTS[align] * content.height);
                offset = getOffset(content.height, position.y, screen.remainingHeight, offset);

                this.setArrowStyle(
                    !!offset,
                    "right",
                    getOffsetValue(offset, ARROW_OFFSET),
                    getOffsetValue(content.width, MENU_OFFSET)
                );

                this.nudgeTop = offset;
                this.nudgeBottom = 0;
                this.nudgeLeft = content.width + this.position.offset;
                this.nudgeRight = 0;

                return true;
            }

            if (direction === "right" && screen.remainingWidth > content.width + position.offset) {
                let offset = Math.round(ALIGNMENTS[align] * content.height);
                offset = getOffset(content.height, position.y, screen.remainingHeight, offset);

                this.setArrowStyle(
                    !!offset,
                    "left",
                    getOffsetValue(offset, ARROW_OFFSET),
                    ARROW_OFFSET
                );

                this.nudgeTop = offset;
                this.nudgeBottom = 0;
                this.nudgeRight = this.position.offset;
                this.nudgeLeft = 0;

                return true;
            }
            return false;
        },

        setArrowStyle(show = true, direction = "right", top = 0, left = 0) {
            this.arrowStyle = {
                display: show ? "block" : "none",
                top: `${top}px`,
                left: `${left}px`,
            };
            this.arrowDirection = direction;
        },

        getContentDimensions() {
            const rect = this.$refs?.["popoverMenuContent"]?.getBoundingClientRect();
            return {
                width: Math.round(rect?.width ?? 0),
                height: Math.round(rect?.height ?? 0),
            };
        },

        getDocumentDimensions(position) {
            let dimensions = {
                height: 0,
                width: 0,
                remainingHeight: 0,
                remainingWidth: 0,
            };

            if (!this.hasWindow) return dimensions;

            dimensions.height = Math.round(
                window.innerHeight || document.documentElement.clientHeight || 0
            );
            dimensions.width = Math.round(
                window.innerWidth || document.documentElement.clientWidth || 0
            );
            dimensions.remainingHeight = dimensions.height - position.y - MENU_END_GUARD;
            dimensions.remainingWidth = dimensions.width - position.x - MENU_END_GUARD;

            return dimensions;
        },

        getAlignment() {
            let align = "center";
            if (this.start) align = "start";
            if (this.end) align = "end";
            return align;
        },

        getDirection() {
            let placement = "right";
            if (this.top) placement = "top";
            else if (this.bottom) placement = "bottom";
            else if (this.left) placement = "left";
            return placement;
        },

        clearDelay() {
            clearTimeout(this.openTimeout);
            clearTimeout(this.closeTimeout);
        },

        runDelay(type, cb) {
            this.clearDelay();

            const delay = parseInt(this[`${type}Delay`], 10);

            this[`${type}Timeout`] = setTimeout(
                cb ||
                    (() => {
                        this.showPopover = { open: true, close: false }[type];
                    }),
                delay
            );
        },
    },
};
</script>
<style scoped>
.custom-popover--container {
    /*Added padding for box shadow to be visible*/
    padding: 16px;
    width: min-content;
    height: min-content;
    border-radius: 0.25rem;
}

.custom-popover--content {
    border-radius: 0.25rem;
}

/*** ARROWS ***/

.arrow {
    position: absolute;
    z-index: 1;
}

.dark-theme-arrow {
    color: #1e1e1e;
}

.light-theme-arrow {
    color: white;
}

.arrow.left {
    border-top-color: transparent;
    border-right-color: inherit;
    border-left-color: inherit;
    border-bottom-color: transparent;
    border-style: solid;
    border-width: 8px 8px 8px 0;
    filter: drop-shadow(-2px 0px 1px rgba(0, 0, 0, 0.2));
    height: 0;
    width: 0;
}

.arrow.right {
    border-top-color: transparent;
    border-right-color: inherit;
    border-left-color: inherit;
    border-bottom-color: transparent;
    border-style: solid;
    border-width: 8px 0 8px 8px;
    filter: drop-shadow(2px 0px 1px rgba(0, 0, 0, 0.2));
    height: 0;
    width: 0;
}

.arrow.top,
.arrow.up {
    border-top-color: inherit;
    border-right-color: transparent;
    border-left-color: transparent;
    border-bottom-color: inherit;
    border-style: solid;
    border-width: 0 8px 8px 8px;
    filter: drop-shadow(0px -2px 1px rgba(0, 0, 0, 0.2));
    height: 0;
    width: 0;
}

.arrow.bottom,
.arrow.down {
    border-top-color: inherit;
    border-right-color: transparent;
    border-left-color: transparent;
    border-bottom-color: inherit;
    border-style: solid;
    border-width: 8px 8px 0 8px;
    filter: drop-shadow(0px 2px 1px rgba(0, 0, 0, 0.2));
    height: 0;
    width: 0;
}

/*** ARROWS ***/
</style>

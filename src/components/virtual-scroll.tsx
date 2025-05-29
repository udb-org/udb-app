import React, {
    memo,
    useCallback,
    useDeferredValue,
    useEffect,
    useRef,
    useState
} from 'react';
// 默认高度缓存项
const defaultHeight = 50;
const VirtualList = ({
    items,
    estimateHeight = defaultHeight,
    buffer = 5,
    renderItem,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [heightCache] = useState(() => new Map());
    const deferredScrollTop = useDeferredValue(scrollTop);
    // 容器尺寸跟踪
    const [containerHeight, setContainerHeight] = useState(0);
    const containerWidth = useRef(0);
    // 使用 ResizeObserver 监听容器高度变化
    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setContainerHeight(entry.contentRect.height);
                containerWidth.current = entry.contentRect.width;
            }
        });
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, []);

    // 计算布局
    const getItemPosition = useCallback((index) => {
        let top = 0;
        for (let i = 0; i < index; i++) {
            top += heightCache.get(i) || estimateHeight;
        }
        return {
            top,
            height: heightCache.get(index) || estimateHeight
        };
    }, [estimateHeight, heightCache]);
    // 测量实际高度
    const measureRef = useCallback((index, node) => {
        if (node) {
            const height = node.getBoundingClientRect().height;
            if (height !== heightCache.get(index)) {
                heightCache.set(index, height);
            }
        }
    }, [heightCache]);
    // 计算可见范围
    const calculateRange = useCallback(() => {
        if (!containerHeight) return [0, 0];
        let currentTop = 0;
        let startIndex = 0;
        const scrollTop = deferredScrollTop;
        // 查找起始索引
        while (startIndex < items.length) {
            const height = heightCache.get(startIndex) || estimateHeight;
            if (currentTop + height > scrollTop) break;
            currentTop += height;
            startIndex++;
        }
        startIndex = Math.max(0, startIndex - buffer);
        // 查找结束索引
        let endIndex = startIndex;
        let visibleHeight = 0;
        while (endIndex < items.length && visibleHeight < containerHeight + scrollTop - currentTop) {
            visibleHeight += heightCache.get(endIndex) || estimateHeight;
            endIndex++;
        }
        endIndex = Math.min(items.length - 1, endIndex + buffer);
        return [startIndex, endIndex];
    }, [containerHeight, deferredScrollTop, items, estimateHeight, buffer, heightCache]);
    const [startIndex, endIndex] = calculateRange();
    const visibleItems = items.slice(startIndex, endIndex + 1);
  
    // 总高度计算
    const totalHeight = items.reduce((acc, _, index) => {
        return acc + (heightCache.get(index) || estimateHeight);
    }, 0);



    const [showScrollBar, setShowScrollBar] = useState(false);
    // 滚动处理
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const handleScroll = useCallback((e) => {
        setScrollTop(e.target.scrollTop);
        setScrollLeft(e.target.scrollLeft);
        // 显示滚动条并设置自动隐藏
        setShowScrollBar(true);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            setShowScrollBar(false);
        }, 2000);  // 2秒无滚动后隐藏

    }, []);  // 空依赖数组保证回调稳定性

    // 清理定时器
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        }
    }, []);


    return (
        <div
            className="virtual-scroll relative h-full  w-full overflow-hidden"
        >
            {
                //滚动条
            }
            {showScrollBar &&
                <>  <div className='absolute w-[6px] h-[20px] bg-foreground/20 right-0 z-10 rounded-full  hover:bg-foreground/60'
                    style={{
                        height: containerHeight / totalHeight * containerHeight,
                        top: (scrollTop / (totalHeight - containerHeight)) * (containerHeight - containerHeight / totalHeight * containerHeight),
                    }}
                    onMouseDown={(e) => {
                        const startY = e.clientY;
                        const startScrollTop = scrollTop;
                        const startHeight = containerHeight / totalHeight * containerHeight;
                        const move = (e: MouseEvent) => {
                            const deltaY = e.clientY - startY;
                            const newScrollTop = startScrollTop + deltaY / (containerHeight - startHeight) * (totalHeight - containerHeight);
                            if (containerRef.current) {
                                containerRef.current.scrollTop = newScrollTop;
                            }
                        };
                        const up = () => {
                            document.removeEventListener('mousemove', move);
                            document.removeEventListener('mouseup', up);
                        };
                        document.addEventListener('mousemove', move);
                        document.addEventListener('mouseup', up);
                    }}
                >
                </div>
                    <div className='absolute h-[6px] w-[20px] bg-foreground/20 bottom-0 z-10 rounded-full  hover:bg-foreground/60'
                        style={{
                            width: 100,
                            left: scrollLeft
                        }}
                        onMouseDown={(e) => {
                            const startX = e.clientX;
                            const startScrollLeft = scrollLeft;
                            const startWidth = containerWidth.current / (contentRef.current.clientWidth) * containerWidth.current;
                            const move = (e: MouseEvent) => {
                                const deltaX = e.clientX - startX;
                                const newScrollLeft = startScrollLeft + deltaX / (containerWidth.current - startWidth) * (contentRef.current.clientWidth - containerWidth.current);
                                if (containerRef.current) {
                                    containerRef.current.scrollLeft = newScrollLeft;
                                }
                            };
                            const up = () => {
                                document.removeEventListener('mousemove', move);
                                document.removeEventListener('mouseup', up);
                            };
                            document.addEventListener('mousemove', move);
                            document.addEventListener('mouseup', up);
                        }}
                    >
                    </div>
                </>
            }
            <div
                ref={containerRef}
                className="virtual-scroll relative  h-full  w-full"
                style={{
                    overflowY: 'auto',
                    scrollbarWidth: 'none'
                }}
                onScroll={handleScroll}
            >
                <div ref={contentRef} style={{
                    height: totalHeight,
                //    width: rowMaxWidth()
                }}>
                    {visibleItems.map((item, index) => {
                        const actualIndex = startIndex + index;
                        const { top } = getItemPosition(actualIndex);
                        return (
                            <div
                                key={actualIndex}
                                ref={(node) => measureRef(actualIndex, node)}
                                style={{
                                    position: 'absolute',
                                    top,
                                    minWidth: containerWidth.current || 200
                                    // width: '100%'
                                }}
                            >
                                {renderItem(item, actualIndex)}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// 优化子组件渲染
VirtualList.Item = memo(({ children }) => children);
export default VirtualList;
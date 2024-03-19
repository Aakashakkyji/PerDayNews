import React, { Component } from "react";
import NewsItem from "./NewsItem";
import Spinner from "./Spinner";
import PropTypes from 'prop-types';
import InfiniteScroll from "react-infinite-scroll-component";

export class News extends Component {
  static defaultProps = {
    country: 'in',
    category: 'general'
  }

  static propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string
  }

  capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  constructor(props) {
    super(props);
   
    this.state = {
      articles: [],
      loading: true,
      page: 1,
      totalResults: 0
    };

    document.title = `${this.capitalizeFirstLetter(this.props.category)} - PerDayNews`;
  }

  async componentDidMount() {
    this.newsUpdate();
  }

  async newsUpdate() {
    this.props.setProgress(5);
    const url = `https://newsapi.org/v2/top-headlines?country=${this.props.country}&category=${this.props.category}&apiKey=214a35860952499eba06b3c5f0f8bee3&page=${this.state.page}&pageSize=${this.props.pageSize}`;
    this.setState({ loading: true });
    try {
      const response = await fetch(url);
      this.props.setProgress(20);
      const parsedData = await response.json();
      this.props.setProgress(50);
      this.setState({
        articles: parsedData.articles,
        totalResults: parsedData.totalResults,
        loading: false
      });
      this.props.setProgress(100);
    } catch (error) {
      console.error('Error fetching news:', error);
      this.setState({ loading: false });
    }
  }

  fetchMoreData = async () => {
    if (this.state.articles.length < this.state.totalResults) {
      this.setState({ page: this.state.page + 1 });
      const url = `https://newsapi.org/v2/top-headlines?country=${this.props.country}&category=${this.props.category}&apiKey=${this.props.apiKey}&page=${this.state.page}&pageSize=${this.props.pageSize}`;
      
      try {
        const response = await fetch(url);
        const parsedData = await response.json();
        this.setState({
          articles: this.state.articles.concat(parsedData.articles),
          totalResults: parsedData.totalResults
        });
      } catch (error) {
        console.error('Error fetching news:', error);
        this.setState({ loading: false });
      }
    }
  };

  render() {
    const { loading, articles } = this.state;

    return (
      <>
        <h1 className="text-center" style={{ margin: '35px 0px' }}>PerDayNews - Top {this.capitalizeFirstLetter(this.props.category)} Headlines</h1>
        {loading && <Spinner />}
        <InfiniteScroll
          dataLength={articles.length}
          next={this.fetchMoreData}
          hasMore={articles.length < this.state.totalResults}
          loader={<Spinner />}
        >
          <div className="container">
            <div className="row">
              {articles.map((element) => (
                <div className="col-md-4" key={element.url}>
                  <NewsItem 
                    title={element.title ? element.title : ""}
                    description={element.description ? element.description : ""}
                    imageUrl={element.urlToImage}
                    newsUrl={element.url}
                    author={element.author}
                    date={element.publishedAt}
                    source={element.source.name}
                  />
                </div>
              ))}
            </div>
          </div>
        </InfiniteScroll>
      </>
    );
  }
}

export default News;

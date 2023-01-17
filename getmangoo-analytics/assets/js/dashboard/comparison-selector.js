import React, { Fragment } from "react";
import { withRouter } from "react-router-dom";
import { ChevronDownIcon } from '@heroicons/react/solid'
import { Transition } from '@headlessui/react'

import { QueryLink } from "./query";

const COMPARISON_PERIOD_TEXT = {
  "previus_period": "Previus period",
  "same_period_last_year": "Same period last year"
}

class ComparisonSelector extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.close = this.close.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = { open: false };
  }


  componentDidMount() {
    document.addEventListener("mousedown", this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClick, false);
  }

  handleClick(e) {
    if (this.dropDownNode && this.dropDownNode.contains(e.target)) return;

    this.setState({ open: false });
  }

  toggle() {
    this.setState(prevState => ({ open: !prevState.open }));
  }

  close() {
    this.setState({ open: false });
  }

  renderPeriodTextSpan() {
    const { query } = this.props;

    let periodText;
    let periodTextClass;

    periodText = COMPARISON_PERIOD_TEXT[query.comparison_period] ? COMPARISON_PERIOD_TEXT[query.comparison_period] : 'Compare to'
    periodTextClass = periodText === 'Compare to' ? 'dark:text-gray-500' : ''

    return <span className={`${periodTextClass} font-medium`}>{periodText}</span>
  }

  renderLink(comparison_period, text) {
    const { query } = this.props;

    let boldClass;
    let placeHolderClass;

    boldClass = query.comparison_period === comparison_period ? "font-bold" : "";
    placeHolderClass = comparison_period === "" ? "dark:text-gray-500 dark:hover:text-gray-500" : "";

    return (
      <QueryLink
        to={{ from: false, to: false, comparison_period}}
        onClick={this.close}
        query={this.props.query}
        className={`${boldClass} px-4 py-2 text-sm leading-tight flex items-center justify-between
        hover:bg-gray-100 hover:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100 ${placeHolderClass}`}
      >
        {text}
      </QueryLink>
    );
  }

  renderDropDownContent() {
    return (
      <div
        id="selectormenu"
        className="absolute w-full left-0 right-0 md:w-56 md:absolute md:top-auto md:left-auto md:right-0 mt-2 origin-top-right z-10"
      >
        <div
          className="rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5
          font-medium text-gray-800 dark:text-gray-200"
        >
          {this.renderLink("", "Compare to")}
          {this.renderLink("previus_period", "Previus period")}
          {this.renderLink("same_period_last_year", "Same period last year")}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="flex ml-auto pl-2">
        <div
          className="w-20 sm:w-36 md:w-48 md:relative"
          ref={(node) => (this.dropDownNode = node)}
        >
          <div
            onClick={this.toggle}
            onKeyPress={this.toggle}
            className="flex items-center justify-between rounded bg-white dark:bg-gray-800 shadow px-2 md:px-3
            py-2 leading-tight cursor-pointer text-xs md:text-sm text-gray-800
            dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-900"
            tabIndex="0"
            role="button"          
            aria-haspopup="true"
            aria-expanded="false"
            aria-controls="selectormenu"
          >
            <span className="truncate mr-1 md:mr-2">
              {this.renderPeriodTextSpan()}
            </span>
            <ChevronDownIcon className="hidden sm:inline-block h-4 w-4 md:h-5 md:w-5 text-gray-500" />
          </div>

          <Transition
            show={this.state.open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            {this.renderDropDownContent()}
          </Transition>
        </div>
      </div>
    );
  }
}

export default withRouter(ComparisonSelector);

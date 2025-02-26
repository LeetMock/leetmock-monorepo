# ResponseActionsScrapeQuestionValue


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**company_tag_stats** | **str** |  | 
**difficulty** | **str** |  | 
**dislikes** | **float** |  | 
**example_testcases** | **str** |  | 
**hints** | **List[object]** |  | 
**is_paid_only** | **bool** |  | 
**likes** | **float** |  | 
**link** | **str** |  | 
**question** | **str** |  | 
**question_frontend_id** | **str** |  | 
**question_id** | **str** |  | 
**question_title** | **str** |  | 
**similar_questions** | **str** |  | 
**solution** | [**ResponseActionsScrapeQuestionValueSolution**](ResponseActionsScrapeQuestionValueSolution.md) |  | 
**title_slug** | **str** |  | 
**topic_tags** | [**List[ResponseActionsScrapeQuestionValueTopicTagsInner]**](ResponseActionsScrapeQuestionValueTopicTagsInner.md) |  | 

## Example

```python
from convex_client.models.response_actions_scrape_question_value import ResponseActionsScrapeQuestionValue

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsScrapeQuestionValue from a JSON string
response_actions_scrape_question_value_instance = ResponseActionsScrapeQuestionValue.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsScrapeQuestionValue.to_json())

# convert the object into a dict
response_actions_scrape_question_value_dict = response_actions_scrape_question_value_instance.to_dict()
# create an instance of ResponseActionsScrapeQuestionValue from a dict
response_actions_scrape_question_value_from_dict = ResponseActionsScrapeQuestionValue.from_dict(response_actions_scrape_question_value_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



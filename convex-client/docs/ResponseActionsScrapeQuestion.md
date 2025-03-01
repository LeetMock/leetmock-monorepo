# ResponseActionsScrapeQuestion


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | [**ResponseActionsScrapeQuestionValue**](ResponseActionsScrapeQuestionValue.md) |  | [optional] 

## Example

```python
from convex_client.models.response_actions_scrape_question import ResponseActionsScrapeQuestion

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsScrapeQuestion from a JSON string
response_actions_scrape_question_instance = ResponseActionsScrapeQuestion.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsScrapeQuestion.to_json())

# convert the object into a dict
response_actions_scrape_question_dict = response_actions_scrape_question_instance.to_dict()
# create an instance of ResponseActionsScrapeQuestion from a dict
response_actions_scrape_question_from_dict = ResponseActionsScrapeQuestion.from_dict(response_actions_scrape_question_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


